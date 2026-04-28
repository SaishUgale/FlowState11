import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  // 1. You MUST await auth() in Clerk v6
  const { userId, orgRole } = await auth(); 
  const user = await currentUser();

  if (!userId || !user) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { room } = await request.json();

  let isAdmin = orgRole === "org:admin";

  try {
     const board = await convex.query(api.board.get, { id: room as any });
     if (board?.authorId === userId) {
         isAdmin = true;
     }
  } catch (err) {
     console.error("Could not fetch board for admin check", err);
  }

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user.firstName ?? "Anonymous",
      picture: user.imageUrl,
      isAdmin,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}