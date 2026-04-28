import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    name: v.string(),
    storage: v.string(),
    authorId: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("versions", {
      boardId: args.boardId,
      name: args.name,
      storage: args.storage,
      authorId: args.authorId,
      authorName: args.authorName,
      createdAt: Date.now(),
    });
  },
});

export const getByBoardId = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("versions")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("versions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
