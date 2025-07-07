"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export async function enrollInCourseAction(
  courseID: string
): Promise<ApiResponse | never> {
  const user = await requireUser();

  let checkoutUrl: string;
  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "You have been blocked",
      };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseID,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    let stripeCustomerID: string;

    const userWithStripeCustomerID = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerID: true,
      },
    });

    if (userWithStripeCustomerID?.stripeCustomerID) {
      stripeCustomerID = userWithStripeCustomerID.stripeCustomerID;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userID: user.id,
        },
      });
      stripeCustomerID = customer.id;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerID: stripeCustomerID,
        },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userID_courseID: {
            userID: user.id,
            courseID: courseID,
          },
        },
        select: {
          status: true,
          id: true,
        },
      });
      if (existingEnrollment?.status === "Active") {
        return {
          status: "success",
          message: "You already enrolled in this course",
        };
      }
      let enrollment;

      if (existingEnrollment) {
        enrollment = await tx.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            amount: course.price,
            status: "Pending",
            updatedAt: new Date(),
          },
        });
      } else {
        enrollment = await tx.enrollment.create({
          data: {
            userID: user.id,
            courseID: course.id,
            amount: course.price,
            status: "Pending",
          },
        });
      }
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerID,
        line_items: [
          {
            price: "price_1RhyskCKoA3jMHuxvUkaJYwF",
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${env.BETTER_AUTH_URL}/payment/success`,
        cancel_url: `${env.BETTER_AUTH_URL}/payment/cancel`,
        metadata: {
          userID: user.id,
          courseID: course.id,
          enrollmentID: enrollment.id,
        },
      });
      return {
        enrollment: enrollment,
        checkoutUrl: checkoutSession.url,
      };
    });

    checkoutUrl = result.checkoutUrl as string;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: "error",
        message: "Payment system error. Please try again later.",
      };
    }
    return {
      status: "error",
      message: "Failed to enroll in course",
    };
  }

  redirect(checkoutUrl);
}
