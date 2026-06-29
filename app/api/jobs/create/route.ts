import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.company || !body.role) {
      return NextResponse.json(
        {
          error: "Company and Role are required",
        },
        { status: 400 }
      );
    }

    const skills =
      body.skills
        ?.split(",")
        .map((skill: string) => skill.trim())
        .filter(Boolean) || [];

    const job = await prisma.job.create({
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
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create job",
      },
      {
        status: 500,
      }
    );
  }
}