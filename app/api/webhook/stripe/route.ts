import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const courseID = session.metadata?.courseID;
    const customerID = session.customer as string;

    if (!courseID) {
      throw new Error("Course ID not found");
    }

    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerID: customerID,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.enrollment.update({
      where: {
        id: session.metadata?.enrollmentID as string,
      },
      data: {
        userID: user.id,
        courseID: courseID,
        amount: session.amount_total as number,
        status: "Active",
      },
    });
  }

  return new Response(null, { status: 200 });
}
