import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { userId, orgRole } = await auth();
    const user = await currentUser();

    if (!userId || !user) return new Response("Unauthorized", { status: 403 });

    const { roomId, versionId } = await request.json();

    if (!roomId || !versionId) return new Response("Missing parameters", { status: 400 });

    let hasPermission = orgRole === "org:admin";
    try {
      const board = await convex.query(api.board.get, { id: roomId as any });
      if (board?.authorId === userId) {
        hasPermission = true;
      }
    } catch (err) {}

    if (!hasPermission) return new Response("Forbidden", { status: 403 });

    // 1. Fetch snapshot from Convex
    const version = await convex.query(api.versions.getById, { id: versionId as any });
    if (!version) return new Response("Version not found", { status: 404 });

    const storageData = JSON.parse(version.storage);

    // 2. Push to Liveblocks Storage
    // The most efficient way to restore full storage is to use the POST /storage endpoint
    // which overwrites the entire storage with the provided JSON.
    const res = await fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/storage`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(storageData)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Liveblocks restore failed:", res.status, text);
      return new Response(`Failed to restore storage: ${text}`, { status: res.status });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Restore error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
