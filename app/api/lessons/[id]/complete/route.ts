import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { id: lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) return NextResponse.json({ message: "Lesson not found." }, { status: 404 });

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: lesson.module.courseId } },
  });
  if (!enrolled) return NextResponse.json({ message: "Not enrolled." }, { status: 403 });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: { userId: session.user.id, lessonId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });

  // Recompute course-level progress %
  const allLessons = await prisma.lesson.count({ where: { module: { courseId: lesson.module.courseId } } });
  const doneLessons = await prisma.lessonProgress.count({
    where: { userId: session.user.id, completed: true, lesson: { module: { courseId: lesson.module.courseId } } },
  });
  const progress = allLessons > 0 ? Math.round((doneLessons / allLessons) * 100) : 0;

  await prisma.enrollment.update({
    where: { userId_courseId: { userId: session.user.id, courseId: lesson.module.courseId } },
    data: { progress, completed: progress === 100, completedAt: progress === 100 ? new Date() : null },
  });

  return NextResponse.json({ success: true, progress });
}