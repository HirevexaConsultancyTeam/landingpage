import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations/course";

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: { resources: true },
            },
          },
        },
        _count: { select: { enrollments: true, reviews: true, orders: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch course." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const normalized = {
      ...body,
      slug: slugify(body.slug || body.title || "", {
        lower: true, strict: true, trim: true,
      }),
      price: body.price === "" || body.price === undefined ? 0 : body.price,
      discount: body.discount === "" || body.discount === undefined ? 0 : body.discount,
      featured: body.featured ?? false,
      published: body.published ?? false,
      categoryId: body.categoryId || null,
      thumbnailUrl: body.thumbnailUrl || null,
      previewVideoUrl: body.previewVideoUrl || null,
      instructor: body.instructor || null,
      duration: body.duration || null,
    };

    const parsed = courseSchema.safeParse(normalized);

    if (!parsed.success) {
      console.error("Course PATCH validation errors:", JSON.stringify(parsed.error.flatten(), null, 2));
      return NextResponse.json(
        { message: "Validation failed.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }

    const duplicate = await prisma.course.findFirst({
      where: { id: { not: id }, slug: parsed.data.slug },
    });
    if (duplicate) {
      return NextResponse.json(
        { message: "Another course already has this slug." },
        { status: 409 }
      );
    }

    if (parsed.data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!cat) {
        return NextResponse.json({ message: "Selected category does not exist." }, { status: 400 });
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        language: parsed.data.language,
        level: parsed.data.level,
        price: parsed.data.price,
        discount: parsed.data.discount,
        featured: parsed.data.featured,
        published: parsed.data.published,
       thumbnailUrl: parsed.data.thumbnailUrl ?? null,
previewVideoUrl: parsed.data.previewVideoUrl ?? null,
        instructor: parsed.data.instructor ?? null,
        duration: parsed.data.duration ?? null,
        categoryId: parsed.data.categoryId ?? null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Course PATCH error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A course with this slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Failed to update course." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }

    if (course._count.enrollments > 0) {
      return NextResponse.json(
        { message: `This course has ${course._count.enrollments} active enrollment(s). Unpublish it instead.` },
        { status: 400 }
      );
    }

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete course." }, { status: 500 });
  }
}