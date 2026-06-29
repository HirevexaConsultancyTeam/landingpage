import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const candidate =
    await prisma.candidate.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  return NextResponse.json({
    resumeUrl:
      candidate?.resumeUrl || null,
  });
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    await prisma.candidate.update({
      where: {
        id: candidate.id,
      },
      data: {
        resumeUrl: null,
      },
    });

    await prisma.document.deleteMany({
      where: {
        candidateId: candidate.id,
        type: "Resume",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}