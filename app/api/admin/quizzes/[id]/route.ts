import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

const NEEDS_OPTIONS = ["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "OUTPUT_PREDICTION"];
const NEEDS_TEXT = ["FILL_BLANK", "SHORT_ANSWER"];

// POST /api/admin/quizzes/[id]/questions
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id: quizId } = await params;
  const {
    question, options = [], correctOptions = [], acceptableAnswers = [],
    type = "MCQ", difficulty = "MEDIUM", points = 1, topic, explanation,
  } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ message: "A question is required." }, { status: 400 });
  }

  if (NEEDS_OPTIONS.includes(type)) {
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ message: "Add at least two options." }, { status: 400 });
    }
    if (!Array.isArray(correctOptions) || correctOptions.length === 0) {
      return NextResponse.json({ message: "Mark at least one option as correct." }, { status: 400 });
    }
    if (type !== "MULTIPLE_SELECT" && correctOptions.length > 1) {
      return NextResponse.json(
        { message: "Only multiple-select questions can have more than one correct option." },
        { status: 400 }
      );
    }
    const bad = correctOptions.some((i: number) => i < 0 || i >= options.length);
    if (bad) {
      return NextResponse.json({ message: "A correct option points at a missing choice." }, { status: 400 });
    }
  }

  if (NEEDS_TEXT.includes(type) && (!Array.isArray(acceptableAnswers) || acceptableAnswers.length === 0)) {
    return NextResponse.json(
      { message: "Add at least one accepted answer for a typed question." },
      { status: 400 }
    );
  }

  const count = await prisma.quizQuestion.count({ where: { quizId } });

  const created = await prisma.quizQuestion.create({
    data: {
      quizId,
      question: question.trim(),
      options,
      correctOptions,
      correctOption: correctOptions[0] ?? 0, // legacy mirror, keeps old readers working
      acceptableAnswers,
      type,
      difficulty,
      points: Number(points) || 1,
      topic: topic?.trim() || null,
      explanation: explanation?.trim() || null,
      order: count + 1,
    },
  });

  return NextResponse.json(created, { status: 201 });
}