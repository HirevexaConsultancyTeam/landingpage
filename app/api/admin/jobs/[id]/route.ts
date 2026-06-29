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

  if (!session || session.user.role !== "ADMIN") {
    return false;
  }

  return true;
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

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
  });

  if (!job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(job);
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

  const skills =
    body.skills
      ?.split(",")
      .map((skill: string) => skill.trim())
      .filter(Boolean) || [];

  const job = await prisma.job.update({
    where: {
      id,
    },
    data: {
      company: body.company,
      role: body.role,

      location: body.location || null,

      jobType: body.jobType || null,

      experience: body.experience || null,

      salary: body.salary || null,

      skills,

      openings: Number(body.openings) || 1,

      description: body.description || null,

      deadline: body.deadline
        ? new Date(body.deadline)
        : null,
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(
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

  await prisma.job.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}