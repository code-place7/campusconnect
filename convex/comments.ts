import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addComments = mutation({
  args: {
    content: v.string(), //the actual comment
    postId: v.id("posts"), // the post on which we want to comment
  },
  handler: async (ctx, args) => {
    // check user authenticated or not
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) throw new Error("User not authenticated");

    // get the user who want to comment
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identify.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    //getting the post on which comments going to be added
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    //the actual comment going to be added
    const commentId = await ctx.db.insert("comments", {
      content: args.content,
      userId: currentUser._id,
      postId: args.postId,
    });
    // incrementing the comments count in the post
    await ctx.db.patch(args.postId, { comments: post.comments + 1 });

    //if not my post create notification
    if (currentUser._id !== post.userId) {
      await ctx.db.insert("notifications", {
        senderId: currentUser._id,
        reciverId: post.userId,
        type: "comment",
        postId: post._id,
        commentId: commentId,
      });
    }

    return commentId; // comment added successfully
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"), //the post of which we want to get all comments
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    //as we want to show comments of who has made the  comments with imageurl and username in the comment section(which is not prestent in comment schema) so we want to return the comments with some additional info which we have earlier done in post section

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: {
            fullname: user!.fullname,
            Image: user!.Image,
          },
        };
      })
    );
    return commentsWithInfo;
  },
});
