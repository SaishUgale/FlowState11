import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  boards: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
    type: v.union(v.literal("board"), v.literal("document"), v.literal("uml"), v.literal("spreadsheet")),
    parentId: v.optional(v.string()), // For document versioning
  })
    .index("by_org", ["orgId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["orgId"],
    }),

  userFavorites: defineTable({
    orgId: v.string(),
    userId: v.string(),
    boardId: v.id("boards"),
  })
    .index("by_board", ["boardId"])
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_board", ["userId", "boardId"])
    .index("by_user_board_org", ["userId", "boardId", "orgId"]),

  versions: defineTable({
    boardId: v.id("boards"),
    name: v.string(),
    storage: v.string(), // JSON stringified storage
    authorId: v.string(),
    authorName: v.string(),
    createdAt: v.number(),
  })
    .index("by_board", ["boardId"]),
});