// ============================================================================
//  DESTINATION:  app/api/payments/verify/route.ts   (replaces existing)
//  Adds an explicit already-PAID guard before processing.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: "Missing payment fields." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const sigValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

    if (!sigValid) {
      return NextResponse.json({ message: "Payment verification failed." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    if (!order || order.userId !== userId) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    // Explicit guard. The webhook may have processed this already, and a
    // double-fired handler must not re-run the transaction. The upserts below
    // are idempotent anyway, but relying on that is implicit — this states it.
    if (order.status === "PAID") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

      await tx.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: order.amount,
          status: "SUCCESS",
          paidAt: new Date(),
        },
        update: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "SUCCESS",
          paidAt: new Date(),
        },
      });

      if (order.type === "REGISTRATION") {
        await tx.user.update({ where: { id: userId }, data: { registrationPaid: true } });
      } else if (order.courseId) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId, courseId: order.courseId } },
          create: { userId, courseId: order.courseId },
          update: {},
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("verify error:", error);
    return NextResponse.json({ message: "Verification failed." }, { status: 500 });
  }
}