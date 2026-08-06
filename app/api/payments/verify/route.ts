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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: "Missing payment fields." }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ message: "Payment verification failed." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
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
        await tx.user.update({ where: { id: order.userId }, data: { registrationPaid: true } });
      } else if (order.type === "COURSE" && order.courseId) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
          create: { userId: order.userId, courseId: order.courseId },
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