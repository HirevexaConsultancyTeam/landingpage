// ============================================================================
//  DESTINATION:  app/api/lessons/[id]/complete/route.ts
//  RENAME THIS FILE TO:  route.ts
//
//  If you are getting "SyntaxError: Unexpected end of JSON input" on this
//  endpoint, the OLD version is still in place — it calls req.json() on a
//  request the learn page sends with no body. This version never parses a body.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule, syncCourseProgress } from "@/lib/progress";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: lessonId } = await params;

  // NOTE: no req.json() here. The client posts with an empty body.

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, moduleId: true, module: { select: { courseId: true } } },
  });
  if (!lesson) {
    return NextResponse.json({ message: "Lesson not found." }, { status: 404 });
  }

  // Covers enrolment AND module locking in one check.
  const access = await canAccessModule(userId, lesson.moduleId);
  if (!access.ok) {
    const status = access.reason === "NOT_FOUND" ? 404 : 403;
    const message =
      access.reason === "NOT_ENROLLED"
        ? "Not enrolled."
        : "Complete the previous module first.";
    return NextResponse.json({ message, reason: access.reason }, { status });
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, completed: true, completedAt: new Date() },
    update: { completed: true, completedAt: new Date() },
  });

  const modules = await syncCourseProgress(userId, lesson.module.courseId);

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    select: { progress: true, completed: true },
  });

  return NextResponse.json({
    success: true,
    progress: enrollment?.progress ?? 0,
    courseCompleted: enrollment?.completed ?? false,
    modules,
  });
}