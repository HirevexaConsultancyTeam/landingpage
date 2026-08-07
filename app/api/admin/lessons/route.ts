import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

// NOTE: every optional string is `.nullish()`, not `.optional()`.
// LessonForm sends `values.content || null`, so a blank field arrives as null —
// and `.optional()` accepts undefined only. That mismatch is what produced the
// 400 on lesson creation whenever any field was left empty. The PATCH route
// already had `.nullable()`, which is why editing worked and creating didn't.
const createLessonSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().nullish(),
  content: z.string().trim().nullish(),
  videoUrl: z.string().trim().nullish(),
  notesUrl: z.string().trim().nullish(),
  duration: z.string().trim().nullish(),
  isPreview: z.boolean().nullish(),

  // Structured lesson body
  slug: z.string().trim().nullish(),
  durationMinutes: z.coerce.number().int().positive().nullish(),
  learningObjectives: z.array(z.string()).nullish(),
  theory: z.string().nullish(),
  codeExamples: z.any().nullish(),
  visualExamples: z.any().nullish(),
  notes: z.string().nullish(),
  interviewTips: z.array(z.string()).nullish(),
  commonMistakes: z.array(z.string()).nullish(),
  bestPractices: z.array(z.string()).nullish(),
  realWorldExample: z.string().nullish(),
  summary: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const courseModule = await prisma.courseModule.findUnique({ where: { id: d.moduleId } });
    if (!courseModule) {
      return NextResponse.json({ message: "Module not found." }, { status: 404 });
    }

    const last = await prisma.lesson.findFirst({
      where: { moduleId: d.moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: d.moduleId,
        title: d.title,
        order: (last?.order ?? 0) + 1,
        description: d.description ?? null,
        content: d.content ?? null,
        videoUrl: d.videoUrl ?? null,
        notesUrl: d.notesUrl ?? null,
        duration: d.duration ?? null,
        isPreview: d.isPreview ?? false,

        slug: d.slug || null,
        durationMinutes: d.durationMinutes ?? null,
        learningObjectives: d.learningObjectives ?? [],
        theory: d.theory ?? null,
        codeExamples: d.codeExamples ?? undefined,
        visualExamples: d.visualExamples ?? undefined,
        notes: d.notes ?? null,
        interviewTips: d.interviewTips ?? [],
        commonMistakes: d.commonMistakes ?? [],
        bestPractices: d.bestPractices ?? [],
        realWorldExample: d.realWorldExample ?? null,
        summary: d.summary ?? null,
      },
      include: { resources: true },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create lesson." }, { status: 500 });
  }
}