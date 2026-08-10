// ============================================================================
//  DESTINATION:  app/api/jobs/route.ts   (replaces existing)
// ============================================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canViewFullJob, sanitiseJob } from "@/lib/jobAccess";

export async function GET() {
  try {
    const session = await auth();
    const canViewFull = await canViewFullJob(session?.user?.id);

    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Every job passes through sanitiseJob. Previously this route returned
    // salary, description and skills to unauthenticated callers.
    return NextResponse.json(jobs.map((job) => sanitiseJob(job, canViewFull)));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}