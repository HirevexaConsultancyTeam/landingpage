import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

const updateModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  description: z.string().trim().optional().nullable(),
  order: z.number().int().min(1).optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const module = await prisma.courseModule.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { resources: true },
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { message: "Module not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch module." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Handle reorder operation
    if (body.reorder && Array.isArray(body.orderedIds)) {
      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid reorder payload." },
          { status: 400 }
        );
      }

      await prisma.$transaction(
        parsed.data.orderedIds.map((moduleId, index) =>
          prisma.courseModule.update({
            where: { id: moduleId },
            data: { order: index + 1 },
          })
        )
      );

      return NextResponse.json({ message: "Modules reordered." });
    }

    // Handle normal update
    const parsed = updateModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const module = await prisma.courseModule.findUnique({ where: { id } });
    if (!module) {
      return NextResponse.json(
        { message: "Module not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.courseModule.update({
      where: { id },
      data: parsed.data,
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { resources: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update module." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const module = await prisma.courseModule.findUnique({
      where: { id },
      include: { _count: { select: { lessons: true } } },
    });

    if (!module) {
      return NextResponse.json(
        { message: "Module not found." },
        { status: 404 }
      );
    }

    // Cascade delete handled by Prisma schema (onDelete: Cascade on lessons)
    await prisma.courseModule.delete({ where: { id } });

    // Re-order remaining modules
    const remaining = await prisma.courseModule.findMany({
      where: { courseId: module.courseId },
      orderBy: { order: "asc" },
    });

    await prisma.$transaction(
      remaining.map((m, index) =>
        prisma.courseModule.update({
          where: { id: m.id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ message: "Module deleted." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete module." },
      { status: 500 }
    );
  }
}