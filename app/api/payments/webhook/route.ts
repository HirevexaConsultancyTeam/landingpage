// ============================================================================
//  DESTINATION:  app/api/payments/webhook/route.ts   (replaces the draft)
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailAsync } from "@/lib/sendEmail";
import { coursePurchaseEmail, registrationPaidEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set — webhook rejected.");
    return NextResponse.json({ message: "Not configured." }, { status: 500 });
  }

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
    payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Bad JSON." }, { status: 400 });
  }

  const type = event.event;
  const payment = event.payload?.payment?.entity;

  if (!payment?.order_id) {
    return NextResponse.json({ received: true });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { razorpayOrderId: payment.order_id },
      include: { course: { select: { title: true, slug: true } } },
    });

    if (!order) {
      console.warn(`Webhook for unknown order ${payment.order_id}`);
      return NextResponse.json({ received: true });
    }

    if (type === "payment.failed") {
      if (order.status === "CREATED") {
        await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      }
      return NextResponse.json({ received: true });
    }

    if (type !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    // Idempotent guard — if /verify already won the race, skip DB writes AND email.
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
        update: { razorpayPaymentId: payment.id ?? null, status: "SUCCESS", paidAt: new Date() },
      });

      if (order.type === "REGISTRATION") {
        await tx.user.update({ where: { id: order.userId }, data: { registrationPaid: true } });
      } else if (order.courseId) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
          create: { userId: order.userId, courseId: order.courseId },
          update: {},
        });
      }
    });

    // Same pattern as /verify: email sent after commit, only by whichever
    // handler actually flipped the status (guaranteed unique by the check above).
    const buyer = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true, candidate: { select: { firstName: true } } },
    });
    const name = buyer?.candidate?.firstName ?? buyer?.email?.split("@")[0] ?? "there";

    if (buyer?.email) {
      if (order.type === "REGISTRATION") {
        sendEmailAsync({
          to: buyer.email,
          subject: "Registration confirmed — HireVexa",
          html: registrationPaidEmail(name, order.amount),
        });
      } else if (order.course) {
        sendEmailAsync({
          to: buyer.email,
          subject: `You're enrolled in ${order.course.title}`,
          html: coursePurchaseEmail(name, order.course.title, order.amount, order.course.slug),
        });
      }
    }

    console.log(`Webhook enrolled user ${order.userId} via order ${order.id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ message: "Processing failed." }, { status: 500 });
  }
}