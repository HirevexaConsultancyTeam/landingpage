import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/enrollments — my enrolled courses
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          include: {
            category: { select: { name: true } },
            modules: {
              include: { lessons: { select: { id: true } } },
            },
            _count: { select: { modules: true } },
          },
        },
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch enrollments." }, { status: 500 });
  }
}

// POST /api/enrollments — direct enroll, FREE COURSES ONLY.
// Paid courses must go through /api/payments/create-order + /api/payments/verify.
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Please login to enroll." }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ message: "courseId is required." }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, published: true },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }

    // Security check: block this endpoint for any paid course.
    // Without this, anyone can POST a paid courseId directly and enroll for free.
    const effectivePrice = course.price - (course.price * course.discount) / 100;
    if (effectivePrice > 0) {
      return NextResponse.json(
        { message: "This course requires payment. Use the checkout flow." },
        { status: 402 }
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (existing) {
      return NextResponse.json({ message: "Already enrolled.", enrollment: existing });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to enroll." }, { status: 500 });
  }
}