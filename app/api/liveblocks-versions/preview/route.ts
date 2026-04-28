import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 403 });

    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get("versionId");

    if (!versionId) return new Response("Missing versionId", { status: 400 });

    // Fetch version from Convex
    const version = await convex.query(api.versions.getById, { id: versionId as any });
    if (!version) return new Response("Version not found", { status: 404 });

    const storageData = JSON.parse(version.storage);
    return Response.json(storageData);
  } catch (error: any) {
    console.error("Preview error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
