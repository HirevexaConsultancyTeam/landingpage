import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createLessonSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  notesUrl: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  isPreview: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { moduleId, title, description, videoUrl, notesUrl, duration, isPreview } =
      parsed.data;

    // Verify module exists
    const module = await prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!module) {
      return NextResponse.json(
        { message: "Module not found." },
        { status: 404 }
      );
    }

    // Get next order number
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = (lastLesson?.order ?? 0) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        description: description ?? null,
        videoUrl: videoUrl ?? null,
        notesUrl: notesUrl ?? null,
        duration: duration ?? null,
        isPreview: isPreview ?? false,
        order,
      },
      include: { resources: true },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create lesson." },
      { status: 500 }
    );
  }
}