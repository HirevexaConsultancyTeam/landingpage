import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { id: moduleId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { moduleId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return NextResponse.json({ message: "No quiz for this module." }, { status: 404 });

  // Strip correct answers before sending to client
  const safeQuiz = {
    id: quiz.id,
    title: quiz.title,
    passScore: quiz.passScore,
    questions: quiz.questions.map(q => ({ id: q.id, question: q.question, options: q.options, order: q.order })),
  };

  return NextResponse.json(safeQuiz);
}