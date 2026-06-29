import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations/course";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const where: Prisma.CourseWhereInput = {};

    if (categoryId) where.categoryId = categoryId;
    if (published === "true") where.published = true;
    if (published === "false") where.published = false;
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { instructor: { contains: search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { enrollments: true, modules: true, reviews: true } },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch courses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Normalize before parsing
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
      console.error("Course validation errors:", JSON.stringify(parsed.error.flatten(), null, 2));
      return NextResponse.json(
        { message: "Validation failed.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.course.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "A course with this slug already exists." },
        { status: 409 }
      );
    }

    if (parsed.data.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
      });
      if (!cat) {
        return NextResponse.json(
          { message: "Selected category does not exist." },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.create({
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

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course create error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A course with this slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create course." },
      { status: 500 }
    );
  }
}