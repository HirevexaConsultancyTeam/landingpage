import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

const createModuleSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().optional(),
});

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ message: "courseId is required." }, { status: 400 });

    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: { lessons: { orderBy: { order: "asc" }, include: { resources: true } }, quiz: true },
    });
    return NextResponse.json(modules);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch modules." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  try {
    const body = await req.json();
    const parsed = createModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Validation failed.", errors: parsed.error.flatten() }, { status: 400 });
    }

    const { courseId, title, description } = parsed.data;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ message: "Course not found." }, { status: 404 });

    const lastModule = await prisma.courseModule.findFirst({ where: { courseId }, orderBy: { order: "desc" }, select: { order: true } });
    const order = (lastModule?.order ?? 0) + 1;

    const module = await prisma.courseModule.create({
      data: { courseId, title, description: description ?? null, order },
      include: { lessons: true },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create module." }, { status: 500 });
  }
}