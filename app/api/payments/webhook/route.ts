// ============================================================================
//  DESTINATION:  app/api/payments/webhook/route.ts   (new file)
//  RENAME TO: route.ts
//
//  Razorpay calls this server-to-server, so enrollment no longer depends on the
//  buyer's browser making it back to your callback. This is the safety net for
//  a dropped connection after capture.
//
//  SETUP (Razorpay Dashboard > Settings > Webhooks):
//    URL     https://www.hirevexaconsultancy.in/api/payments/webhook
//    Events  payment.captured, payment.failed
//    Secret  generate one, then set RAZORPAY_WEBHOOK_SECRET in your env
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set — webhook rejected.");
    return NextResponse.json({ message: "Not configured." }, { status: 500 });
  }

  // Raw body is required: the signature is computed over the exact bytes sent.
  // Parsing to JSON first and re-stringifying would change key order or spacing
  // and the signature would never match.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing signature." }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const valid =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) {
    console.warn("Razorpay webhook signature mismatch — ignoring.");
    return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          status?: string;
        };
      };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Bad JSON." }, { status: 400 });
  }

  const type = event.event;
  const payment = event.payload?.payment?.entity;

  // Always 200 for events we don't handle. A non-2xx makes Razorpay retry, and
  // retrying something we deliberately ignore is just noise in their dashboard.
  if (!payment?.order_id) {
    return NextResponse.json({ received: true });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: payment.order_id },
    });

    if (!order) {
      console.warn(`Webhook for unknown order ${payment.order_id}`);
      return NextResponse.json({ received: true });
    }

    if (type === "payment.failed") {
      if (order.status === "CREATED") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
      }
      return NextResponse.json({ received: true });
    }

    if (type !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    // Idempotent: the browser callback usually gets here first, and Razorpay
    // retries webhooks. Neither may double-process.
    if (order.status === "PAID") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          razorpayPaymentId: payment.id ?? null,
          amount: order.amount,
          status: "SUCCESS",
          paidAt: new Date(),
        },
        update: {
          razorpayPaymentId: payment.id ?? null,
          status: "SUCCESS",
          paidAt: new Date(),
        },
      });

      if (order.type === "REGISTRATION") {
        await tx.user.update({
          where: { id: order.userId },
          data: { registrationPaid: true },
        });
      } else if (order.courseId) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
          create: { userId: order.userId, courseId: order.courseId },
          update: {},
        });
      }
    });

    console.log(`Webhook enrolled user ${order.userId} via order ${order.id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // 500 tells Razorpay to retry, which is what we want for a transient
    // database failure — the payment is real and must eventually be recorded.
    return NextResponse.json({ message: "Processing failed." }, { status: 500 });
  }
}