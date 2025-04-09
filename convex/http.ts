import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

//1-> we nee dto make sure that the webhook event is coming from clerk
//2-> if so, we will listen for the user.created event
//3-> we will save the the user to database

http.route({
  path: "/clerk-user-auth",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const signature = request.headers.get("svix-signature");
    const timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !signature || !timestamp) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const webhook = new Webhook(webhookSecret);
    let event: any;
    try {
      event = webhook.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": timestamp,
        "svix-signature": signature,
      }) as any;
    } catch (error) {
      console.error("Webhook verification failed", error);
      return new Response("Invalid svix headers", { status: 400 });
    }

    const eventType = event.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.createUser, {
          username: email.split("@")[0],
          fullname: name,
          Image: image_url,
          bio: "",
          email: email,
          clerkId: id,
        });
      } catch (error) {
        console.log("Error creating user", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook handled", { status: 200 });
  }),
});

export default http;
