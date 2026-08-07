import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEnrolled, syncCourseProgress } from "@/lib/progress";

// GET /api/enrollments/[courseId]/progress
//
// BACKWARD COMPATIBILITY: the old version returned a bare
// { [lessonId]: true } map, and the current learn page spreads it directly into
// state. That shape is preserved at the top level, with `modules` and `summary`
// added alongside — so nothing breaks before the learn page is rewritten.
export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { courseId } = await params;

  if (!(await isEnrolled(userId, courseId))) {
    return NextResponse.json({ message: "Not enrolled." }, { status: 403 });
  }

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, completed: true, lesson: { module: { courseId } } },
    select: { lessonId: true },
  });

  const lessonMap: Record<string, boolean> = {};
  completed.forEach((c) => {
    lessonMap[c.lessonId] = true;
  });

  const modules = await syncCourseProgress(userId, courseId);

  const totalLessons = modules.reduce((a, m) => a + m.lessonsTotal, 0);
  const doneLessons = modules.reduce((a, m) => a + m.lessonsCompleted, 0);

  return NextResponse.json({
    ...lessonMap, // legacy shape
    lessons: lessonMap,
    modules,
    summary: {
      modulesTotal: modules.length,
      modulesCompleted: modules.filter((m) => m.status === "COMPLETED").length,
      lessonsTotal: totalLessons,
      lessonsCompleted: doneLessons,
      percent: totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0,
    },
  });
}