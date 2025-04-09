import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    Image: v.string(),
    bio: v.optional(v.string()),
    clerkId: v.string(),
    email: v.string(),
    followers: v.number(),
    following: v.number(),
    fullname: v.string(),
    posts: v.number(),
    username: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  posts: defineTable({
    userId: v.id("users"),
    caption: v.optional(v.string()),
    comments: v.number(),
    imageUrl: v.string(),
    likes: v.number(),
    storageId: v.id("_storage"),
  })
    .index("by_likes", ["likes"])
    .index("by_user_id", ["userId"]),

  bookmarkds: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_user_and_post", ["userId", "postId"]),
  comments: defineTable({
    content: v.string(),
    postId: v.id("posts"),
    userId: v.id("users"),
  }).index("by_post", ["postId"]),
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_both", ["followerId", "followingId"])
    .index("by_following", ["followingId"])
    .index("by_folow", ["followerId"]),
  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),
  notifications: defineTable({
    commentId: v.optional(v.id("comments")),
    postId: v.optional(v.id("posts")),
    reciverId: v.id("users"),
    senderId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
  })
    .index("by_post_id", ["postId"])
    .index("by_receiver", ["reciverId"]),
});
