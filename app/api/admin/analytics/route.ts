import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
    ]);

    return NextResponse.json({
      totalCandidates,
      totalJobs,
      activeJobs,
      totalApplications,
      placedApplications,
      applicationStatus,
      candidateStatus,
      topCompanies,
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