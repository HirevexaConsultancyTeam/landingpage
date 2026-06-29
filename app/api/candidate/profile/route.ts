import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const candidate =
      await prisma.candidate.findUnique({
        where: {
          userId: session.user.id,
        },

        include: {
          documents: {
            orderBy: {
              uploadedAt: "desc",
            },
          },

          applications: {
            include: {
              job: {
                select: {
                  company: true,
                  role: true,
                },
              },
            },

            orderBy: {
              appliedAt: "desc",
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
        error: "Something went wrong",
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

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const candidate = await prisma.candidate.update({
      where: {
        userId: session.user.id,
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
        jobType: body.jobType,
        salary: body.salary,
        locations: body.locations || [],
        skills: body.skills || [],
      },
    });

    return NextResponse.json(candidate);
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}