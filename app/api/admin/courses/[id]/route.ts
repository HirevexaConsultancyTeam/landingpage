// ============================================================================
//  DESTINATION:  app/api/admin/courses/[id]/route.ts
//  RENAME THIS FILE TO:  route.ts
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations/course";
import { requireAdmin } from "@/lib/adminGuard";

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

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

/**
 * PATCH /api/admin/courses/[id]
 *
 * Validates with `courseSchema.partial()` so only the fields actually sent are
 * checked. The previous version ran the full create schema on every request,
 * which meant a publish toggle sending `{ published: false }` was rejected for
 * a description it never touched — and courses whose descriptions predate the
 * 20-character rule could not be edited at all.
 *
 * Rules still apply to whatever IS sent: a 5-character description still fails.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    const { id } = await params;
    const body = await req.json();

    // Normalise only the keys present. Defaulting absent keys (the old
    // `body.featured ?? false`) silently unfeatured a course on any partial
    // update that didn't mention it.
    const normalized: Record<string, unknown> = { ...body };

    if (body.slug !== undefined || body.title !== undefined) {
      const source = body.slug || body.title || "";
      if (source) {
        normalized.slug = slugify(source, { lower: true, strict: true, trim: true });
      } else {
        delete normalized.slug;
      }
    }

    if (body.price !== undefined) normalized.price = body.price === "" ? 0 : Number(body.price);
    if (body.discount !== undefined) normalized.discount = body.discount === "" ? 0 : Number(body.discount);

    for (const key of ["categoryId", "thumbnailUrl", "previewVideoUrl", "instructor", "duration"] as const) {
      if (body[key] !== undefined) normalized[key] = body[key] || null;
    }

    const parsed = courseSchema.partial().safeParse(normalized);

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

    // Only worth checking when the slug is actually changing.
    if (parsed.data.slug && parsed.data.slug !== course.slug) {
      const duplicate = await prisma.course.findFirst({
        where: { id: { not: id }, slug: parsed.data.slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { message: "Another course already has this slug." },
          { status: 409 }
        );
      }
    }

    if (parsed.data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
      if (!cat) {
        return NextResponse.json({ message: "Selected category does not exist." }, { status: 400 });
      }
    }

    // Write only what was sent, so a partial update can't blank a field the
    // caller never mentioned.
    const data: Prisma.CourseUpdateInput = {};
    const d = parsed.data;

    if (d.title !== undefined) data.title = d.title;
    if (d.slug !== undefined) data.slug = d.slug;
    if (d.shortDescription !== undefined) data.shortDescription = d.shortDescription;
    if (d.description !== undefined) data.description = d.description;
    if (d.language !== undefined) data.language = d.language;
    if (d.level !== undefined) data.level = d.level;
    if (d.price !== undefined) data.price = d.price;
    if (d.discount !== undefined) data.discount = d.discount;
    if (d.featured !== undefined) data.featured = d.featured;
    if (d.published !== undefined) data.published = d.published;
    if (d.thumbnailUrl !== undefined) data.thumbnailUrl = d.thumbnailUrl ?? null;
    if (d.previewVideoUrl !== undefined) data.previewVideoUrl = d.previewVideoUrl ?? null;
    if (d.instructor !== undefined) data.instructor = d.instructor ?? null;
    if (d.duration !== undefined) data.duration = d.duration ?? null;

    if (d.categoryId !== undefined) {
      data.category = d.categoryId ? { connect: { id: d.categoryId } } : { disconnect: true };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "Nothing to update." }, { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Course PATCH error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
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
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

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