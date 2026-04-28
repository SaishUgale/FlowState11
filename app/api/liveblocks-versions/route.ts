import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Liveblocks } from "@liveblocks/node";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    const { userId, orgRole } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new Response("Unauthorized", { status: 403 });
    }

    const body = await request.json();
    const { roomId, name } = body;

    if (!roomId) {
      return new Response("Missing roomId", { status: 400 });
    }

    // Determine if user has permission (is admin or author)
    let hasPermission = orgRole === "org:admin";
    
    try {
      const board = await convex.query(api.board.get, { id: roomId as any });
      if (board?.authorId === userId) {
        hasPermission = true;
      }
    } catch (err) {
      console.error("Board query failed for permission check:", err);
    }

    if (!hasPermission) {
      return new Response("Forbidden: Admin or Author rights required to save versions.", { status: 403 });
    }

    // 1. Fetch current storage from Liveblocks
    const storageRes = await fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/storage`, {
      headers: {
        "Authorization": `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`
      }
    });

    if (!storageRes.ok) {
      const errorText = await storageRes.text();
      console.error("Failed to fetch storage for snapshot:", storageRes.status, errorText);
      return new Response(`Failed to fetch current state: ${errorText}`, { status: storageRes.status });
    }

    const storageData = await storageRes.json();

    // 2. Save snapshot to Convex
    const versionName = name || `Manual Save - ${new Date().toLocaleString()}`;
    
    await convex.mutation(api.versions.create, {
      boardId: roomId as any,
      name: versionName,
      storage: JSON.stringify(storageData),
      authorId: userId,
      authorName: user.firstName ?? "Anonymous",
    });

    return Response.json({ success: true, name: versionName });
  } catch (error: any) {
    console.error("Error creating version:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 403 });

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) return new Response("Missing roomId", { status: 400 });

    // Fetch versions from Convex
    const versions = await convex.query(api.versions.getByBoardId, { boardId: roomId as any });
    
    // Transform to match the UI expectations (id, createdAt, name)
    const formattedVersions = versions.map((v: any) => ({
      id: v._id,
      createdAt: new Date(v.createdAt).toISOString(),
      name: v.name,
      authorId: v.authorId,
      authorName: v.authorName,
    }));

    return Response.json(formattedVersions);
  } catch (error: any) {
    console.error("Error fetching versions:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
