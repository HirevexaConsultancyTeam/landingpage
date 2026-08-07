import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule } from "@/lib/progress";
import { shuffle } from "@/lib/quiz-grading";

// GET /api/modules/[id]/quiz
//
// Creates the attempt row up front and stores which questions were served.
// That is what makes sampling safe: grading later runs against this stored list,
// so a student cannot submit answers for only the three they are sure of.
//
// NOTE: this file replaces app/app/api/modules/[id]/quiz/route.ts, which sat one
// directory too deep and served /app/api/... — the cause of the 404 students hit
// when opening any module quiz. Delete the old app/app directory.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: moduleId } = await params;

  const access = await canAccessModule(userId, moduleId);
  if (!access.ok) {
    const status = access.reason === "NOT_FOUND" ? 404 : 403;
    const message =
      access.reason === "NOT_FOUND"
        ? "Module not found."
        : access.reason === "NOT_ENROLLED"
          ? "You are not enrolled in this course."
          : "Complete the previous module to unlock this assessment.";
    return NextResponse.json({ message, reason: access.reason }, { status });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { moduleId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) {
    return NextResponse.json({ message: "No quiz for this module." }, { status: 404 });
  }
  if (quiz.questions.length === 0) {
    return NextResponse.json(
      { message: "This assessment has no questions yet." },
      { status: 404 }
    );
  }

  const take = quiz.questionsPerAttempt ?? quiz.questions.length;
  const served = shuffle(quiz.questions).slice(0, Math.min(take, quiz.questions.length));

  const previous = await prisma.quizAttempt.count({ where: { userId, quizId: quiz.id } });

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId: quiz.id,
      attemptNumber: previous + 1,
      startedAt: new Date(),
      servedQuestionIds: served.map((q) => q.id),
      pointsPossible: served.reduce((a, q) => a + q.points, 0),
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    id: quiz.id,
    title: quiz.title,
    passScore: quiz.passScore,
    attemptNumber: attempt.attemptNumber,
    totalQuestions: served.length,
    bankSize: quiz.questions.length,
    // Answer keys, explanations and acceptable answers are never sent before submit.
    questions: served.map((q, i) => ({
      id: q.id,
      order: i + 1,
      question: q.question,
      options: q.options,
      type: q.type,
      points: q.points,
      difficulty: q.difficulty,
    })),
  });
}