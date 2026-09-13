import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalCandidates,
      totalJobs,
      activeJobs,
      totalApplications,
      placedApplications,
      applicationStatus,
      candidateStatus,
      topCompanies,
      registrationTrendRaw,
    ] = await Promise.all([
      prisma.candidate.count(),

      prisma.job.count(),

      prisma.job.count({
        where: {
          isActive: true,
        },
      }),

      prisma.application.count(),

      prisma.application.count({
        where: {
          status: "PLACED",
        },
      }),

      prisma.application.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      prisma.candidate.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      prisma.job.findMany({
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          applications: {
            _count: "desc",
          },
        },
        take: 5,
      }),

      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "Candidate"
        WHERE "createdAt" >= NOW() - INTERVAL '14 days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    const registrationTrend: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = registrationTrendRaw.find(
        (r) => r.date.toISOString().slice(0, 10) === key
      );
      registrationTrend.push({ date: key, count: found ? Number(found.count) : 0 });
    }

    return NextResponse.json({
      totalCandidates,
      totalJobs,
      activeJobs,
      totalApplications,
      placedApplications,
      applicationStatus,
      candidateStatus,
      topCompanies,
      registrationTrend,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load analytics",
      },
      {
        status: 500,
      }
    );
  }
}