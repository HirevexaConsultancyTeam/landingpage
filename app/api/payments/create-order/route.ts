import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay, REGISTRATION_FEE } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { type, courseId } = await req.json();

    if (type !== "COURSE" && type !== "REGISTRATION") {
      return NextResponse.json({ message: "Invalid order type." }, { status: 400 });
    }

    let amount: number;
    let resolvedCourseId: string | null = null;

    if (type === "REGISTRATION") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (user?.registrationPaid) {
        return NextResponse.json({ message: "Registration fee already paid." }, { status: 400 });
      }
      amount = REGISTRATION_FEE;
    } else {
      if (!courseId) {
        return NextResponse.json({ message: "courseId is required." }, { status: 400 });
      }
      const course = await prisma.course.findUnique({ where: { id: courseId, published: true } });
      if (!course) {
        return NextResponse.json({ message: "Course not found." }, { status: 404 });
      }
      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId } },
      });
      if (existing) {
        return NextResponse.json({ message: "Already enrolled." }, { status: 400 });
      }
      amount = course.price - (course.price * course.discount) / 100;
      resolvedCourseId = course.id;
    }

    if (amount <= 0) {
      return NextResponse.json({ message: "Invalid amount for a paid order." }, { status: 400 });
    }

    const dbOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        courseId: resolvedCourseId ?? undefined,
        type,
        amount,
        status: "CREATED",
      },
    });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: dbOrder.id,
      notes: { type, courseId: resolvedCourseId ?? "", userId: session.user.id },
    });

    const updated = await prisma.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      orderId: updated.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json({ message: "Failed to create order." }, { status: 500 });
  }
}