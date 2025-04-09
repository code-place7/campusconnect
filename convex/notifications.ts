import { query } from "./_generated/server";

export const getNotifications = query({
  //since we want to fetch all notifications from database so no need to define args aka arguments
  handler: async (ctx) => {
    // check user authenticated or not
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) throw new Error("User not authenticated");

    // get the user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identify.subject))
      .first();
    if (!currentUser) throw new Error("User not found");

    const notifications = ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("reciverId", currentUser._id))
      .order("desc")
      .collect();

    // once we get all the notifications from the table we cant sat return notifications cuz we dont have much info about the post and the sender who is sending the notification other than just theirs id's we wnt more info like sender username image post image etc. must be wondering how i know just hover over it

    const notificationsWithInfo = await Promise.all(
      (await notifications).map(async (notification) => {
        // for each notification
        const sender = (await ctx.db.get(notification.senderId))!; //get the sender
        let post = null;
        let comment = null;

        if (notification.postId) {
          post = await ctx.db.get(notification.postId); //get the post
        }
        if (notification.type === "comment") {
          if (notification.commentId) {
            comment = await ctx.db.get(notification.commentId); //get the comment
          }
        }
        return {
          ...notification,
          sender: {
            _id: sender._id,
            fullname: sender.fullname,
            image: sender.Image,
          },
          post: {
            Image: post?.imageUrl,
          },
          comment: {
            content: comment?.content,
          },
        };
      })
    );

    return notificationsWithInfo;
  },
});
