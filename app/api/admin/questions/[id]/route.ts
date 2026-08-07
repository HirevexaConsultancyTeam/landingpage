import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const { title, passScore, questionsPerAttempt } = await req.json();

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (passScore !== undefined) data.passScore = Number(passScore);
  if (questionsPerAttempt !== undefined) {
    // null / empty means "serve the whole bank"
    data.questionsPerAttempt =
      questionsPerAttempt === null || questionsPerAttempt === "" ? null : Number(questionsPerAttempt);
  }

  const quiz = await prisma.quiz.update({ where: { id }, data });
  return NextResponse.json(quiz);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ message: "Quiz deleted." });
}