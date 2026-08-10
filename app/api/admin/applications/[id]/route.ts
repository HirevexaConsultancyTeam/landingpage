// ============================================================================
//  DESTINATION:  app/api/admin/applications/[id]/route.ts   (replaces existing)
//
//  Adds validation and clears stale fields when the status changes away from
//  the state that produced them.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      candidate: { include: { user: true } },
      job: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const validStatuses = Object.values(AppStatus) as string[];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const status: AppStatus = body.status;

  // A rejection reason is shown to the candidate, so require one rather than
  // letting a bare "Rejected" appear on their dashboard with no explanation.
  if (status === "REJECTED" && !body.rejectionReason?.trim()) {
    return NextResponse.json(
      { error: "Add a reason — the candidate will see this." },
      { status: 400 }
    );
  }

  // Clear fields that no longer apply. Without this, a candidate moved from
  // REJECTED to INTERVIEW_SCHEDULED keeps a stale rejection reason, which their
  // dashboard would still render.
  const application = await prisma.application.update({
    where: { id },
    data: {
      status,
      notes: body.notes ?? null,
      interviewDate:
        status === "INTERVIEW_SCHEDULED" && body.interviewDate
          ? new Date(body.interviewDate)
          : null,
      offerSalary:
        status === "OFFER_RECEIVED" || status === "PLACED"
          ? body.offerSalary || null
          : null,
      rejectionReason: status === "REJECTED" ? body.rejectionReason.trim() : null,
    },
  });

  return NextResponse.json(application);
}