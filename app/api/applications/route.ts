// ============================================================================
//  DESTINATION:  app/api/applications/route.ts   (replaces existing)
//
//  Two changes:
//   - POST now requires a paid registration (was missing — the UI hid the
//     button but the endpoint accepted direct calls).
//   - GET added so candidates can see their own applications. It deliberately
//     does NOT return `notes`.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/applications — the signed-in candidate's own applications.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!candidate) return NextResponse.json([]);

    const applications = await prisma.application.findMany({
      where: { candidateId: candidate.id },
      orderBy: { appliedAt: "desc" },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
        interviewDate: true,
        offerSalary: true,
        rejectionReason: true,
        // `notes` is INTENTIONALLY absent. Recruiters write candid assessments
        // there — "weak communication", "overpriced", "not a culture fit".
        // Selecting fields explicitly rather than excluding them means a future
        // field added to the model doesn't leak here by default.
        job: {
          select: {
            id: true,
            company: true,
            role: true,
            location: true,
            jobType: true,
          },
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch applications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Registration gate. The apply button hides itself for unregistered users,
    // but that's cosmetic — this is what actually enforces it.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { registrationPaid: true, role: true },
    });

    const isStaff = user?.role === "ADMIN" || user?.role === "COUNSELLOR";

    if (!isStaff && !user?.registrationPaid) {
      return NextResponse.json(
        { error: "Complete your registration to apply." },
        { status: 402 }
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate profile not found." }, { status: 404 });
    }

    if (!candidate.firstName || !candidate.lastName || !candidate.degree || !candidate.college) {
      return NextResponse.json(
        { error: "Please complete your profile before applying." },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { _count: { select: { applications: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: "This job is no longer accepting applications." },
        { status: 400 }
      );
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return NextResponse.json({ error: "Application deadline has passed." }, { status: 400 });
    }

    if (job._count.applications >= job.openings) {
      return NextResponse.json(
        { error: "All openings for this job have been filled." },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: { candidateId: candidate.id, jobId },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong while submitting your application." },
      { status: 500 }
    );
  }
}