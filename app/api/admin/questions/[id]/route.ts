// ============================================================================
//  DESTINATION:  app/api/admin/questions/[id]/route.ts
//  RENAME THIS FILE TO:  route.ts
//  NOTE the folder is  questions/[id]  — NOT  quizzes/[id]/questions
//  This file contains PATCH and DELETE. It edits or removes one question.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/questions/[id]
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

  // Keep the legacy single-index field in step with the array.
  if (body.correctOptions !== undefined) {
    data.correctOptions = body.correctOptions;
    data.correctOption = body.correctOptions[0] ?? 0;
  }

  const updated = await prisma.quizQuestion.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/admin/questions/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  await prisma.quizQuestion.delete({ where: { id } });
  return NextResponse.json({ message: "Question deleted." });
}