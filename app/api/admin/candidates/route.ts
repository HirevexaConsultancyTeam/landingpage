import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";

    const status = searchParams.get("status") || "";

    const page = Number(searchParams.get("page") || "1");

    const limit = Number(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          college: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          degree: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          branch: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,

        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },

          _count: {
            select: {
              applications: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip: (page - 1) * limit,

        take: limit,
      }),

      prisma.candidate.count({
        where,
      }),
    ]);

    return NextResponse.json({
      candidates,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch candidates",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Candidate ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const candidate =
      await prisma.candidate.findUnique({
        where: {
          id,
        },
      });

    if (!candidate) {
      return NextResponse.json(
        {
          error: "Candidate not found",
        },
        {
          status: 404,
        }
      );
    }

    const updated =
      await prisma.candidate.update({
        where: {
          id,
        },
        data,
      });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update candidate",
      },
      {
        status: 500,
      }
    );
  }
}