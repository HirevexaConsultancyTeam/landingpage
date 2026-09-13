import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    const [candidatesRegistered, activeJobs, hiringPartners, totalApplications, placedApplications] =
      await Promise.all([
        prisma.candidate.count(),
        prisma.job.count({ where: { isActive: true } }),
        prisma.job.findMany({ select: { company: true }, distinct: ["company"] }).then((r) => r.length),
        prisma.application.count(),
        prisma.application.count({ where: { status: "PLACED" } }),
      ]);

    const placementRate =
      totalApplications > 0 ? Math.round((placedApplications / totalApplications) * 100) : 0;

    return NextResponse.json({ candidatesRegistered, activeJobs, hiringPartners, placementRate });
  } catch (error) {
    console.error("public stats error:", error);
    return NextResponse.json(
      { candidatesRegistered: 0, activeJobs: 0, hiringPartners: 0, placementRate: 0 },
      { status: 200 }
    );
  }
}