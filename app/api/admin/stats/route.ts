import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      candidates, jobs, applications, courses, categories, enrollments,
      placed, offers, interviews,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.enrollment.count(),
      prisma.application.count({ where: { status: "PLACED" } }),
      prisma.application.count({ where: { status: "OFFER_RECEIVED" } }),
      prisma.application.count({ where: { status: "INTERVIEW_SCHEDULED" } }),
    ]);

    return NextResponse.json({
      candidates, jobs, applications, courses,
      categories, enrollments, placed, offers, interviews,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch stats." }, { status: 500 });
  }
}