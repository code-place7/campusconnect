import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadurl = mutation(async (ctx) => {
  const identify = await ctx.auth.getUserIdentity();

  if (!identify) throw new Error("User not authenticated");
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) throw new Error("User not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identify.subject))
      .first();
    if (!currentUser) throw new Error("User not found");
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Unable to get uploaded image URL");

    //createpost

    const postid = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption || "",
      likes: 0,
      comments: 0,
    });

    //increment the no. of post of user
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postid;
  },
});

export const getPosts = query({
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

    // get all posts
    const posts = await ctx.db
      .query("posts")

      .order("desc")
      .collect();

    if (posts.length === 0) return [];

    // enhance each post with likes and comments count and based on user data
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const postauthor = (await ctx.db.get(post.userId))!;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarkds")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postauthor?._id,
            username: postauthor?.username,
            fullname: postauthor?.fullname,
            Image: postauthor?.Image,
          },
          isLiked: !!like, /// like is object so we used !! to make it boolean
          isBookmarked: !!bookmark, /// bookmark is object so we used !! to make it boolean
        };
      })
    );

    return postsWithDetails;
  },
});

export const toggleLke = mutation({
  args: {
    postId: v.id("posts"),
  },
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

    // check if we already like the post or not by looking into the likes table
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    //get the actual post
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    // if we have already like the post we will delete or add or we can say ou toggle logic start
    if (existing) {
      //remove like
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false; // unliked
    } else {
      //add like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      //if not my post create a notification
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          senderId: currentUser._id,
          reciverId: post.userId,
          type: "like",
          postId: args.postId,
        });
      }
      return true; // liked
    }
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
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

    // check if the post exists and belongs to the current user
    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== currentUser._id)
      throw new Error("Unauthorized");

    // delete the post and its comments and likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    //delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    //delete associated bookmarks
    const bookmarks = await ctx.db
      .query("bookmarkds")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // delete associated notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // delete the storage file
    await ctx.storage.delete(post.storageId);

    // delete the post itself
    await ctx.db.delete(post._id);

    //decrement the user's post count
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    });
  },
});

const getAuthenticatedUser = async (ctx: any) => {
  //check if user is authenticated
  const identify = await ctx.auth.getUserIdentity();

  if (!identify) throw new Error("User not authenticated");

  //get the current user from database
  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: { eq: (arg0: string, arg1: any) => any }) =>
      q.eq("clerkId", identify.subject)
    )
    .first();
  if (!currentUser) throw new Error("User not found");

  return currentUser; // Return the authenticated user
};

export const getPostsByUser = query({
  // for profile screen
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const user = args.userId
      ? await ctx.db.get(args.userId) // Fetch user by ID if provided
      : await getAuthenticatedUser(ctx); // Fetch the authenticated user

    if (!user) throw new Error("User not found");

    // get all posts of either the current user or user id provided in args
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId || user._id))
      .collect();

    return posts;
  },
});

export const getFeaturedPosts = query({
  args: {},
  handler: async (ctx) => {
    // Query the posts collection and sort by the number of likes in descending order
    const featuredPosts = await ctx.db
      .query("posts")
      .withIndex("by_likes")
      .order("desc")
      .collect(); // Assuming an index exists for sorting by likes
    // Limit to top 10 posts

    return featuredPosts;
  },
});
