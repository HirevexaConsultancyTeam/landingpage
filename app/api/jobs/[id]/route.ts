// ============================================================================
//  DESTINATION:  app/api/jobs/[id]/route.ts   (replaces the stub)
//  The old file returned { message: "Not implemented yet" }.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canViewFullJob, sanitiseJob } from "@/lib/jobAccess";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const canViewFull = await canViewFullJob(session?.user?.id);

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json(sanitiseJob(job, canViewFull));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}