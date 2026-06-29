import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400 }
      );
    }

    // Find candidate

    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found." },
        { status: 404 }
      );
    }

    // Basic profile validation

    if (
      !candidate.firstName ||
      !candidate.lastName ||
      !candidate.degree ||
      !candidate.college
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete your profile before applying.",
        },
        {
          status: 400,
        }
      );
    }

    // Find Job

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // Job Active

    if (!job.isActive) {
      return NextResponse.json(
        {
          error:
            "This job is no longer accepting applications.",
        },
        {
          status: 400,
        }
      );
    }

    // Deadline

    if (
      job.deadline &&
      new Date(job.deadline) < new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "Application deadline has passed.",
        },
        {
          status: 400,
        }
      );
    }

    // Openings Available

    if (
      job._count.applications >= job.openings
    ) {
      return NextResponse.json(
        {
          error:
            "All openings for this job have been filled.",
        },
        {
          status: 400,
        }
      );
    }

    // Already Applied

    const existing =
      await prisma.application.findUnique({
        where: {
          candidateId_jobId: {
            candidateId: candidate.id,
            jobId,
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You have already applied for this job.",
        },
        {
          status: 400,
        }
      );
    }

    // Create Application

    const application =
      await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId,
        },
      });

    return NextResponse.json(application);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your application.",
      },
      {
        status: 500,
      }
    );
  }
}