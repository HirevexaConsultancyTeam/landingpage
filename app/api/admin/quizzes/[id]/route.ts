import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  const { title, passScore } = await req.json();
  const quiz = await prisma.quiz.update({ where: { id }, data: { title, passScore } });
  return NextResponse.json(quiz);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  await prisma.quiz.delete({ where: { id } });
  return NextResponse.json({ message: "Quiz deleted." });
}