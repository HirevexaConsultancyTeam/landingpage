import { prisma } from "@/lib/prisma";
import { ModuleStatus } from "@prisma/client";

/**
 * If true, a module with a quiz is only COMPLETED when the student has both
 * finished every lesson AND passed the quiz. If false, passing the quiz alone
 * completes it (this is what the reference demo does).
 *
 * Trade-off to be aware of: with `true`, an admin adding a new lesson to an
 * already-completed module will flip that module back to IN_PROGRESS for every
 * student, which can re-lock later modules. That is arguably correct, but it is
 * surprising on a live course. Flip to `false` if support complaints start.
 */
export const REQUIRE_LESSONS_BEFORE_MODULE_COMPLETE = true;

export interface ModuleProgressView {
  moduleId: string;
  order: number;
  status: ModuleStatus;
  bestQuizScore: number;
  lessonsTotal: number;
  lessonsCompleted: number;
  hasQuiz: boolean;
  isFinalExam: boolean;
}

/**
 * Recomputes every module's status for one student on one course, then persists it.
 *
 * This is deliberately a full recompute from source data (LessonProgress +
 * QuizAttempt) rather than an incremental mutation. It is idempotent, it is safe
 * to call from anywhere, and it self-heals if a write was ever missed — which
 * matters because module locking is the thing standing between a student and
 * content they may not have finished paying for.
 *
 * Unlock rules:
 *   - Modules are ordered by `order`.
 *   - The first non-final module always starts UNLOCKED.
 *   - A non-final module unlocks when the previous non-final module is COMPLETED.
 *   - The final-exam module unlocks only when EVERY non-final module is COMPLETED.
 *   - A module is COMPLETED when its quiz is passed (see the constant above).
 *     A module with no quiz completes when all its lessons are done.
 */
export async function syncCourseProgress(
  userId: string,
  courseId: string
): Promise<ModuleProgressView[]> {
  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      isFinalExam: true,
      lessons: { select: { id: true } },
      quiz: { select: { id: true, passScore: true } },
    },
  });

  if (modules.length === 0) return [];

  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));

  const [completedLessons, attempts] = await Promise.all([
    lessonIds.length
      ? prisma.lessonProgress.findMany({
          where: { userId, completed: true, lessonId: { in: lessonIds } },
          select: { lessonId: true },
        })
      : Promise.resolve([]),
    prisma.quizAttempt.findMany({
      where: { userId, quiz: { module: { courseId } } },
      select: { quizId: true, score: true, passed: true },
    }),
  ]);

  const doneLessonIds = new Set(completedLessons.map((l) => l.lessonId));

  const bestByQuiz = new Map<string, { best: number; passed: boolean }>();
  for (const a of attempts) {
    const cur = bestByQuiz.get(a.quizId);
    bestByQuiz.set(a.quizId, {
      best: Math.max(cur?.best ?? 0, a.score),
      passed: (cur?.passed ?? false) || a.passed,
    });
  }

  // Pass 1 — completion, independent of ordering.
  const computed = modules.map((m) => {
    const lessonsTotal = m.lessons.length;
    const lessonsCompleted = m.lessons.filter((l) => doneLessonIds.has(l.id)).length;
    const allLessonsDone = lessonsTotal === 0 || lessonsCompleted === lessonsTotal;

    const quizState = m.quiz ? bestByQuiz.get(m.quiz.id) : undefined;
    const bestQuizScore = quizState?.best ?? 0;
    const quizPassed = quizState?.passed ?? false;

    const completed = m.quiz
      ? REQUIRE_LESSONS_BEFORE_MODULE_COMPLETE
        ? quizPassed && allLessonsDone
        : quizPassed
      : lessonsTotal > 0 && allLessonsDone;

    const started = lessonsCompleted > 0 || bestQuizScore > 0;

    return {
      moduleId: m.id,
      order: m.order,
      isFinalExam: m.isFinalExam,
      hasQuiz: Boolean(m.quiz),
      lessonsTotal,
      lessonsCompleted,
      bestQuizScore,
      completed,
      started,
    };
  });

  // Pass 2 — unlocking, which depends on order.
  const nonFinal = computed.filter((m) => !m.isFinalExam);
  const allNonFinalComplete = nonFinal.length > 0 && nonFinal.every((m) => m.completed);

  let previousComplete = true; // the first non-final module is open from the start
  const views: ModuleProgressView[] = computed.map((m) => {
    let status: ModuleStatus;

    if (m.completed) {
      status = ModuleStatus.COMPLETED;
    } else {
      const unlocked = m.isFinalExam ? allNonFinalComplete : previousComplete;
      status = !unlocked
        ? ModuleStatus.LOCKED
        : m.started
          ? ModuleStatus.IN_PROGRESS
          : ModuleStatus.UNLOCKED;
    }

    if (!m.isFinalExam) previousComplete = m.completed;

    return {
      moduleId: m.moduleId,
      order: m.order,
      status,
      bestQuizScore: m.bestQuizScore,
      lessonsTotal: m.lessonsTotal,
      lessonsCompleted: m.lessonsCompleted,
      hasQuiz: m.hasQuiz,
      isFinalExam: m.isFinalExam,
    };
  });

  // Persist. `unlockedAt` / `completedAt` are stamped once and never overwritten,
  // so they survive a module briefly reverting (e.g. admin adds a lesson).
  const now = new Date();
  await prisma.$transaction(
    views.map((v) =>
      prisma.moduleProgress.upsert({
        where: { userId_moduleId: { userId, moduleId: v.moduleId } },
        create: {
          userId,
          moduleId: v.moduleId,
          status: v.status,
          bestQuizScore: v.bestQuizScore,
          unlockedAt: v.status === ModuleStatus.LOCKED ? null : now,
          completedAt: v.status === ModuleStatus.COMPLETED ? now : null,
        },
        update: {
          status: v.status,
          bestQuizScore: v.bestQuizScore,
        },
      })
    )
  );

  // Stamp the timestamps that upsert-update can't express conditionally.
  await prisma.$transaction([
    prisma.moduleProgress.updateMany({
      where: {
        userId,
        moduleId: { in: views.filter((v) => v.status !== ModuleStatus.LOCKED).map((v) => v.moduleId) },
        unlockedAt: null,
      },
      data: { unlockedAt: now },
    }),
    prisma.moduleProgress.updateMany({
      where: {
        userId,
        moduleId: { in: views.filter((v) => v.status === ModuleStatus.COMPLETED).map((v) => v.moduleId) },
        completedAt: null,
      },
      data: { completedAt: now },
    }),
  ]);

  // Keep the course-level percentage in sync (lesson-based, as before).
  const totalLessons = computed.reduce((a, m) => a + m.lessonsTotal, 0);
  const doneLessons = computed.reduce((a, m) => a + m.lessonsCompleted, 0);
  const percent = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
  const courseComplete = views.length > 0 && views.every((v) => v.status === ModuleStatus.COMPLETED);

  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: {
      progress: percent,
      completed: courseComplete,
      completedAt: courseComplete ? now : null,
    },
  });

  return views;
}

/** Throws-free enrollment check. */
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const e = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  return Boolean(e);
}

/**
 * Server-side gate for anything module-scoped (quiz questions, lesson bodies).
 * Recomputes first so the answer reflects reality, not a stale row.
 */
export async function canAccessModule(
  userId: string,
  moduleId: string
): Promise<{ ok: true; courseId: string } | { ok: false; reason: "NOT_FOUND" | "NOT_ENROLLED" | "LOCKED" }> {
  const mod = await prisma.courseModule.findUnique({
    where: { id: moduleId },
    select: { id: true, courseId: true },
  });
  if (!mod) return { ok: false, reason: "NOT_FOUND" };

  if (!(await isEnrolled(userId, mod.courseId))) {
    return { ok: false, reason: "NOT_ENROLLED" };
  }

  const views = await syncCourseProgress(userId, mod.courseId);
  const view = views.find((v) => v.moduleId === moduleId);

  if (!view || view.status === ModuleStatus.LOCKED) {
    return { ok: false, reason: "LOCKED" };
  }

  return { ok: true, courseId: mod.courseId };
}