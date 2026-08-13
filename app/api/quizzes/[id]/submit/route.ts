// ============================================================================
//  DESTINATION: app/api/quizzes/[id]/submit/route.ts
//  This REPLACES the current file, which has the lesson-complete handler's
//  code pasted into it (it looks up prisma.lesson.findUnique using the quiz
//  id as a lessonId — that's the 404 you're seeing: "Lesson not found.").
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule, syncCourseProgress } from "@/lib/progress";

const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

type AnswerValue = number | number[] | string | boolean | null;

/**
 * POST /api/quizzes/[id]/submit
 * Body: { attemptId: string, answers: Record<questionId, AnswerValue> }
 *
 * Grades ONLY the questions recorded on the attempt (attempt.servedQuestionIds)
 * — never trusts extra question ids the client might send. Requires the
 * attemptId from GET /api/modules/[moduleId]/quiz, and rejects an attempt that
 * doesn't belong to this user or this quiz, or that was already submitted.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: quizId } = await params;

  let body: { attemptId?: string; answers?: Record<string, AnswerValue> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const { attemptId, answers } = body;
  if (!attemptId || typeof answers !== "object" || answers === null) {
    return NextResponse.json({ message: "Missing attemptId or answers." }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) {
    return NextResponse.json({ message: "Quiz not found." }, { status: 404 });
  }

  // Access check mirrors the GET route: enrolment + module unlocked.
  const access = await canAccessModule(userId, quiz.moduleId);
  if (!access.ok) {
    const status = access.reason === "NOT_FOUND" ? 404 : 403;
    const message =
      access.reason === "NOT_ENROLLED"
        ? "You are not enrolled in this course."
        : "Complete the previous module to unlock this assessment.";
    return NextResponse.json({ message, reason: access.reason }, { status });
  }

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId || attempt.quizId !== quizId) {
    return NextResponse.json({ message: "Attempt not found." }, { status: 404 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json({ message: "This attempt was already submitted." }, { status: 409 });
  }

  const questionById = new Map(quiz.questions.map((q) => [q.id, q]));
  const served = attempt.servedQuestionIds
    .map((qid) => questionById.get(qid))
    .filter((q): q is (typeof quiz.questions)[number] => Boolean(q));

  let pointsEarned = 0;
  const pointsPossible = served.reduce((sum, q) => sum + q.points, 0);
  const weakTopics = new Set<string>();
  const perQuestion: Record<string, boolean> = {};

  for (const q of served) {
    const response = answers[q.id] ?? null;
    let isCorrect = false;

    switch (q.type) {
      case "MULTIPLE_SELECT": {
        const expected = [...q.correctOptions].sort((a, b) => a - b);
        const picked = Array.isArray(response)
          ? [...new Set(response as number[])].sort((a, b) => a - b)
          : [];
        isCorrect = picked.length === expected.length && picked.every((v, i) => v === expected[i]);
        break;
      }
      case "TRUE_FALSE": {
        isCorrect = response === (q.correctOption === 0);
        break;
      }
      case "FILL_BLANK":
      case "SHORT_ANSWER": {
        const acceptable = q.acceptableAnswers.map(normalise);
        const given = typeof response === "string" ? normalise(response) : "";
        isCorrect = given.length > 0 && acceptable.includes(given);
        break;
      }
      case "MCQ":
      case "OUTPUT_PREDICTION":
      default: {
        isCorrect = response === q.correctOption;
        break;
      }
    }

    perQuestion[q.id] = isCorrect;
    if (isCorrect) pointsEarned += q.points;
    else if (q.topic) weakTopics.add(q.topic);
  }

  const score = pointsPossible > 0 ? Math.round((pointsEarned / pointsPossible) * 100) : 0;
  const passed = score >= quiz.passScore;

  await prisma.quizAttempt.update({
    where: { id: attempt.id },
    data: {
      score,
      passed,
      pointsEarned,
      pointsPossible,
      answers: { ...answers, __perQuestion: perQuestion } as never,
      weakTopics: Array.from(weakTopics),
      submittedAt: new Date(),
    },
  });

  // Track the best score for this module regardless of pass/fail.
  const moduleProgress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: quiz.moduleId } },
  });
  await prisma.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId: quiz.moduleId } },
    create: {
      userId,
      moduleId: quiz.moduleId,
      status: passed ? "COMPLETED" : "IN_PROGRESS",
      bestQuizScore: score,
      completedAt: passed ? new Date() : null,
    },
    update: {
      bestQuizScore: Math.max(moduleProgress?.bestQuizScore ?? 0, score),
      status: passed ? "COMPLETED" : moduleProgress?.status ?? "IN_PROGRESS",
      completedAt: passed ? new Date() : moduleProgress?.completedAt ?? null,
    },
  });

  // Single source of truth for percentages, unlocking the next module, etc.
  const courseId = (
    await prisma.courseModule.findUnique({ where: { id: quiz.moduleId }, select: { courseId: true } })
  )?.courseId;
  const modules = courseId ? await syncCourseProgress(userId, courseId) : [];

  return NextResponse.json({
    success: true,
    score,
    passed,
    pointsEarned,
    pointsPossible,
    passScore: quiz.passScore,
    weakTopics: Array.from(weakTopics),
    results: perQuestion,
    modules,
  });
}