import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const applications = await prisma.application.findMany({
    orderBy: {
      appliedAt: "desc",
    },

    include: {
      candidate: {
        include: {
          user: true,
        },
      },

      job: true,
    },
  });

  return NextResponse.json(applications);
}