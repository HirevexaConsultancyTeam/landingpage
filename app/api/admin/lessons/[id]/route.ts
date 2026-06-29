import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

const updateLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  description: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().optional().nullable(),
  notesUrl: z.string().trim().optional().nullable(),
  duration: z.string().trim().optional().nullable(),
  isPreview: z.boolean().optional(),
  order: z.number().int().min(1).optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { resources: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch lesson." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Handle reorder operation for lessons within a module
    if (body.reorder && Array.isArray(body.orderedIds)) {
      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid reorder payload." },
          { status: 400 }
        );
      }

      await prisma.$transaction(
        parsed.data.orderedIds.map((lessonId, index) =>
          prisma.lesson.update({
            where: { id: lessonId },
            data: { order: index + 1 },
          })
        )
      );

      return NextResponse.json({ message: "Lessons reordered." });
    }

    // Normal update
    const parsed = updateLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.lesson.update({
      where: { id },
      data: parsed.data,
      include: { resources: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update lesson." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found." },
        { status: 404 }
      );
    }

    await prisma.lesson.delete({ where: { id } });

    // Re-order remaining lessons in the same module
    const remaining = await prisma.lesson.findMany({
      where: { moduleId: lesson.moduleId },
      orderBy: { order: "asc" },
    });

    await prisma.$transaction(
      remaining.map((l, index) =>
        prisma.lesson.update({
          where: { id: l.id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ message: "Lesson deleted." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete lesson." },
      { status: 500 }
    );
  }
}