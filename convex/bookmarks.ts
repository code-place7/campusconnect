import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleBookmark = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    //check if user is authenticated
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) throw new Error("User not authenticated");

    //get the current user from database
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identify.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    //get the post to toggle bookmark
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    //check if user already bookmark the post or not by looking into the bookmarks table
    const existing = await ctx.db
      .query("bookmarkds")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    if (existing) {
      // if user already bookmark the post then remove it
      await ctx.db.delete(existing._id);
      return false;
    } else {
      // if user not bookmark the post then add it
      await ctx.db.insert("bookmarkds", {
        userId: currentUser._id,
        postId: args.postId,
      });
      return true;
    }
  },
});

export const getBookmarkedPosts = query({
  handler: async (ctx) => {
    //check if user is authenticated
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) throw new Error("User not authenticated");

    //get the current user from database
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identify.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    //get all bookmarked posts by the user
    const bookmarkedPosts = await ctx.db
      .query("bookmarkds")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect();

    //as we know the above code will not provide all info about the post we need to show on the bookmark screen so we will make it better

    const bookmarksWithInfo = await Promise.all(
      bookmarkedPosts.map(async (bookmark) => {
        //for each bookmark
        const post = await ctx.db.get(bookmark.postId); //get the post
        return post;
      })
    );

    return bookmarksWithInfo;
  },
});
