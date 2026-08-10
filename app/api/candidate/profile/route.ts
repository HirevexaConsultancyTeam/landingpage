import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        degree: true,
        branch: true,
        college: true,
        gradYear: true,
        cgpa: true,
        experience: true,
        jobType: true,
        salary: true,
        locations: true,
        skills: true,
        resumeUrl: true,
        profileScore: true,
        status: true,
        createdAt: true,

        documents: { orderBy: { uploadedAt: "desc" } },

        // Explicit select, not include. `notes` holds recruiters' candid
        // assessments and must never reach the candidate. Listing fields
        // rather than excluding them means a field added to the model later
        // doesn't leak here by default.
        applications: {
          orderBy: { appliedAt: "desc" },
          select: {
            id: true,
            status: true,
            appliedAt: true,
            updatedAt: true,
            interviewDate: true,
            offerSalary: true,
            rejectionReason: true,
            job: { select: { id: true, company: true, role: true } },
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
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