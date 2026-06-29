import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function checkAdmin() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return false;
  }

  return true;
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const candidate = await prisma.candidate.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobile: true,
            createdAt: true,
          },
        },

        applications: {
          include: {
            job: {
              select: {
                id: true,
                company: true,
                role: true,
                location: true,
                salary: true,
                jobType: true,
                isActive: true,
              },
            },
          },

          orderBy: {
            appliedAt: "desc",
          },
        },

        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
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

    return NextResponse.json(candidate);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch candidate",
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
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await req.json();

    const candidate =
      await prisma.candidate.update({
        where: {
          id,
        },

        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          city: body.city,
          degree: body.degree,
          branch: body.branch,
          college: body.college,
          gradYear: body.gradYear,
          cgpa: body.cgpa,
          experience: body.experience,
          salary: body.salary,
          jobType: body.jobType,
          locations: body.locations,
          skills: body.skills,
          profileScore:
            body.profileScore,
          status: body.status,
        },
      });

    return NextResponse.json(candidate);
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

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.candidate.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to delete candidate",
      },
      {
        status: 500,
      }
    );
  }
}