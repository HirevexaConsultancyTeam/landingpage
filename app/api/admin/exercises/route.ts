import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// GET /api/admin/exercises?lessonId=...
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ message: "lessonId is required." }, { status: 400 });
  }

  const exercises = await prisma.exercise.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(exercises);
}

// POST /api/admin/exercises
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const {
    lessonId, type = "MCQ", prompt, payload = {},
    hint, solution, explanation, starterCode, expectedOutput,
  } = await req.json();

  if (!lessonId || !prompt?.trim()) {
    return NextResponse.json({ message: "A lesson and a prompt are required." }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return NextResponse.json({ message: "Lesson not found." }, { status: 404 });

  const count = await prisma.exercise.count({ where: { lessonId } });

  const created = await prisma.exercise.create({
    data: {
      lessonId,
      order: count + 1,
      type,
      prompt: prompt.trim(),
      payload,
      hint: hint?.trim() || null,
      solution: solution?.trim() || null,
      explanation: explanation?.trim() || null,
      starterCode: starterCode?.trim() || null,
      expectedOutput: expectedOutput?.trim() || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}