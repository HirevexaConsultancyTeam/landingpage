import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch category.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const parsed = categorySchema.safeParse({
      ...body,
      slug: slugify(body.slug || body.name, {
        lower: true,
        strict: true,
        trim: true,
      }),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [
          {
            name: parsed.data.name,
          },
          {
            slug: parsed.data.slug,
          },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          message: "Another category already exists with the same name or slug.",
        },
        {
          status: 409,
        }
      );
    }

    const updated = await prisma.category.update({
      where: {
        id,
      },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "Duplicate category.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to update category.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (category._count.courses > 0) {
      return NextResponse.json(
        {
          message:
            "This category contains courses. Move or delete the courses before deleting the category.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to delete category.",
      },
      {
        status: 500,
      }
    );
  }
}