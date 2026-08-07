import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id: quizId } = await params;
  const { question, options, correctOption } = await req.json();

  if (!question || !Array.isArray(options) || options.length < 2 || correctOption == null) {
    return NextResponse.json({ message: "question, options[2+], and correctOption are required." }, { status: 400 });
  }

  const count = await prisma.quizQuestion.count({ where: { quizId } });
  const created = await prisma.quizQuestion.create({
    data: { quizId, question, options, correctOption, order: count },
  });
  return NextResponse.json(created, { status: 201 });
}