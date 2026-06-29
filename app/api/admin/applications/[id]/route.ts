import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function checkAdmin() {
  const session = await auth();

  return session?.user.role === "ADMIN";
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  if (!(await checkAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const application =
    await prisma.application.findUnique({
      where: {
        id,
      },

      include: {
        candidate: {
          include: {
            user: true,
          },
        },

        job: true,
      },
    });

  if (!application) {
    return NextResponse.json(
      {
        error: "Application not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(application);
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  if (!(await checkAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const body = await req.json();

  const application =
    await prisma.application.update({
      where: {
        id,
      },

      data: {
        status: body.status,

        notes: body.notes,

        interviewDate:
          body.interviewDate
            ? new Date(body.interviewDate)
            : null,

        offerSalary:
          body.offerSalary || null,

        rejectionReason:
          body.rejectionReason || null,
      },
    });

  return NextResponse.json(application);
}