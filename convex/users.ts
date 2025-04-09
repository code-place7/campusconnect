import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  // for login purposes
  args: {
    username: v.string(),
    fullname: v.string(),
    Image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) return;

    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      Image: args.Image,
      bio: args.bio,
      email: args.email,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});

export const getUserByClerkId = query({
  //
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
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

    //update the user profile
    await ctx.db.patch(currentUser._id, {
      fullname: args.fullname,
      bio: args.bio,
    });
  },
});

export const getUserProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("user not found");

    return user;
  },
});

export const isFollowing = query({
  args: { followingId: v.id("users") },
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

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    return !!follow; //convert object to boolean
  },
});

export const toggleFollow = mutation({
  args: { followingId: v.id("users") },
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

    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    if (existingFollow) {
      //unFollow the user
      await ctx.db.delete(existingFollow._id); // delete this document

      await updateFollowCount(ctx, currentUser._id, args.followingId, false); // decrement the follower count for both user
    } else {
      // follow the user
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.followingId,
      }); // insert this document

      await updateFollowCount(ctx, currentUser._id, args.followingId, true); // increament the follower count for both user
    }

    // create a notification
    await ctx.db.insert("notifications", {
      reciverId: args.followingId,
      senderId: currentUser._id,
      type: "follow",
    });
  },
});

async function updateFollowCount(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollow: boolean
) {
  const follower = await ctx.db.get(followerId);
  const following = await ctx.db.get(followingId);

  if (follower && following) {
    await ctx.db.patch(followerId, {
      following: follower.following + (isFollow ? 1 : -1), // increament or decreament will depend on yhe boolean we pass to this function
    });
    await ctx.db.patch(followingId, {
      followers: following.followers + (isFollow ? 1 : -1),
    });
  }
}
