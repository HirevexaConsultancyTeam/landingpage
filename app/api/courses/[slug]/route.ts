import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isEnrolled, syncCourseProgress } from "@/lib/progress";

interface Params {
  params: Promise<{ slug: string }>;
}

// GET /api/courses/[slug]/content — ENROLLED ONLY.
//
// Returns the full course tree with lesson bodies, but only for modules the
// student has unlocked. Locked modules come back as titles + counts so the
// sidebar can still render them greyed out, with no content attached.
//
// This is the single endpoint the learn page should call.
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      instructor: true,
      level: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          summary: true,
          icon: true,
          order: true,
          slug: true,
          isFinalExam: true,
          quiz: { select: { id: true, title: true, passScore: true } },
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              order: true,
              isPreview: true,
              duration: true,
              durationMinutes: true,
              videoUrl: true,
              notesUrl: true,
              content: true,
              theory: true,
              learningObjectives: true,
              codeExamples: true,
              visualExamples: true,
              interviewTips: true,
              commonMistakes: true,
              bestPractices: true,
              realWorldExample: true,
              summary: true,
              exercises: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  order: true,
                  type: true,
                  prompt: true,
                  payload: true,
                  hint: true,
                  // solution + explanation are withheld until the student answers.
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }

  if (!(await isEnrolled(userId, course.id))) {
    return NextResponse.json({ message: "You are not enrolled in this course." }, { status: 403 });
  }

  const progress = await syncCourseProgress(userId, course.id);
  const statusByModule = new Map(progress.map((p) => [p.moduleId, p]));

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId, completed: true, lesson: { module: { courseId: course.id } } },
    select: { lessonId: true },
  });
  const doneLessonIds = new Set(completedLessons.map((l) => l.lessonId));

  const modules = course.modules.map((m) => {
    const view = statusByModule.get(m.id);
    const locked = !view || view.status === "LOCKED";

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      summary: m.summary,
      icon: m.icon,
      order: m.order,
      slug: m.slug,
      isFinalExam: m.isFinalExam,
      status: view?.status ?? "LOCKED",
      bestQuizScore: view?.bestQuizScore ?? 0,
      lessonsTotal: view?.lessonsTotal ?? m.lessons.length,
      lessonsCompleted: view?.lessonsCompleted ?? 0,
      quiz: locked ? null : m.quiz,
      hasQuiz: Boolean(m.quiz),
      // Locked modules expose titles only — never bodies, videos or exercises.
      lessons: m.lessons.map((l) =>
        locked
          ? {
              id: l.id,
              title: l.title,
              order: l.order,
              durationMinutes: l.durationMinutes,
              duration: l.duration,
              locked: true,
              completed: false,
            }
          : { ...l, locked: false, completed: doneLessonIds.has(l.id) }
      ),
    };
  });

  return NextResponse.json({
    id: course.id,
    title: course.title,
    slug: course.slug,
    instructor: course.instructor,
    level: course.level,
    modules,
  });
}