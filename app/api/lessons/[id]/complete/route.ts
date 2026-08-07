import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule, syncCourseProgress } from "@/lib/progress";
import { isAnswerCorrect, type SubmittedAnswer } from "@/lib/quiz-grading";

// POST /api/quizzes/[id]/submit
// Body: { attemptId: string, answers: { [questionId]: number | number[] | string } }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: quizId } = await params;
  const body = await req.json();
  const attemptId: string | undefined = body?.attemptId;
  const answers: Record<string, SubmittedAnswer> = body?.answers ?? {};

  if (!attemptId) {
    return NextResponse.json(
      { message: "attemptId is required. Reopen the assessment." },
      { status: 400 }
    );
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { select: { id: true, courseId: true } } },
  });
  if (!quiz) {
    return NextResponse.json({ message: "Quiz not found." }, { status: 404 });
  }

  // Enrolment + module lock in one check.
  const access = await canAccessModule(userId, quiz.module.id);
  if (!access.ok) {
    const status = access.reason === "NOT_FOUND" ? 404 : 403;
    return NextResponse.json(
      { message: "You can't take this assessment yet.", reason: access.reason },
      { status }
    );
  }

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId || attempt.quizId !== quizId) {
    return NextResponse.json({ message: "Attempt not found." }, { status: 404 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json(
      { message: "This attempt was already submitted. Start a new one." },
      { status: 409 }
    );
  }

  // Grade ONLY the questions this attempt was served — never what the client sends.
  const questions = await prisma.quizQuestion.findMany({
    where: { id: { in: attempt.servedQuestionIds } },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));

  interface ReviewRow {
    questionId: string;
    question: string;
    type: string;
    options: string[];
    points: number;
    difficulty: string;
    topic: string | null;
    submitted: SubmittedAnswer;
    correctOptions: number[];
    acceptableAnswers: string[];
    isCorrect: boolean;
    explanation: string | null;
  }

  const review: ReviewRow[] = [];
  for (const qid of attempt.servedQuestionIds) {
    const q = byId.get(qid);
    if (!q) continue;

    const submitted = answers[qid] ?? null;

    review.push({
      questionId: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      difficulty: q.difficulty,
      topic: q.topic ?? null,
      submitted,
      correctOptions: q.correctOptions.length > 0 ? q.correctOptions : [q.correctOption],
      acceptableAnswers: q.acceptableAnswers,
      isCorrect: isAnswerCorrect(q, submitted),
      explanation: q.explanation ?? null,
    });
  }

  const pointsPossible = review.reduce((a, r) => a + r.points, 0);
  const pointsEarned = review.reduce((a, r) => a + (r.isCorrect ? r.points : 0), 0);
  const score = pointsPossible > 0 ? Math.round((pointsEarned / pointsPossible) * 100) : 0;
  const passed = score >= quiz.passScore;

  const weakTopics = Array.from(
    new Set(review.filter((r) => !r.isCorrect && r.topic).map((r) => r.topic as string))
  );

  await prisma.quizAttempt.update({
    where: { id: attempt.id },
    data: {
      score,
      passed,
      pointsEarned,
      pointsPossible,
      weakTopics,
      answers: review as unknown as object[],
      submittedAt: new Date(),
    },
  });

  // Recompute locking — this is what actually opens the next module.
  const progress = await syncCourseProgress(userId, quiz.module.courseId);
  const thisModule = progress.find((p) => p.moduleId === quiz.module.id);
  const nextModule = progress
    .filter((p) => p.order > (thisModule?.order ?? 0) && p.status !== "LOCKED")
    .sort((a, b) => a.order - b.order)[0];

  return NextResponse.json({
    score,
    passed,
    passScore: quiz.passScore,
    pointsEarned,
    pointsPossible,
    correct: review.filter((r) => r.isCorrect).length,
    total: review.length,
    attemptNumber: attempt.attemptNumber,
    weakTopics,
    review,
    moduleStatus: thisModule?.status ?? null,
    unlockedNextModuleId: passed ? (nextModule?.moduleId ?? null) : null,
  });
}