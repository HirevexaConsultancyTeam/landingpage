import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { id: quizId } = await params;
  const { answers } = await req.json(); // { [questionId]: selectedOptionIndex }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) return NextResponse.json({ message: "Quiz not found." }, { status: 404 });

  let correct = 0;
  for (const q of quiz.questions) {
    if (answers?.[q.id] === q.correctOption) correct++;
  }
  const score = quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0;
  const passed = score >= quiz.passScore;

  await prisma.quizAttempt.create({
    data: { userId: session.user.id, quizId, score, passed },
  });

  return NextResponse.json({ score, passed, correct, total: quiz.questions.length });
}