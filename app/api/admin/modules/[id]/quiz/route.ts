import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id: moduleId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { moduleId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(quiz); // null if none exists yet — frontend handles that
}

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id: moduleId } = await params;
  const { title, passScore } = await req.json();

  const existing = await prisma.quiz.findUnique({ where: { moduleId } });
  if (existing) return NextResponse.json({ message: "Quiz already exists for this module." }, { status: 409 });

  const quiz = await prisma.quiz.create({
    data: { moduleId, title: title || "Module Quiz", passScore: passScore ?? 70 },
    include: { questions: true },
  });
  return NextResponse.json(quiz, { status: 201 });
}