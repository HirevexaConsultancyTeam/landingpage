import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.question !== undefined) data.question = body.question;
  if (body.options !== undefined) data.options = body.options;
  if (body.acceptableAnswers !== undefined) data.acceptableAnswers = body.acceptableAnswers;
  if (body.type !== undefined) data.type = body.type;
  if (body.difficulty !== undefined) data.difficulty = body.difficulty;
  if (body.points !== undefined) data.points = Number(body.points) || 1;
  if (body.topic !== undefined) data.topic = body.topic?.trim() || null;
  if (body.explanation !== undefined) data.explanation = body.explanation?.trim() || null;
  if (body.order !== undefined) data.order = body.order;

  if (body.correctOptions !== undefined) {
    data.correctOptions = body.correctOptions;
    data.correctOption = body.correctOptions[0] ?? 0; // keep the legacy field in step
  }

  const updated = await prisma.quizQuestion.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  await prisma.quizQuestion.delete({ where: { id } });
  return NextResponse.json({ message: "Question deleted." });
}