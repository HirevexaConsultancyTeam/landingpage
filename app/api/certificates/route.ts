import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const certs = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json(certs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ message: "courseId is required." }, { status: 400 });

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrolled) return NextResponse.json({ message: "Not enrolled." }, { status: 403 });

  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    include: { lessons: true, quiz: { include: { attempts: { where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 1 } } } },
  });

  // Every lesson in every module must be completed
  const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id));
  const completedCount = await prisma.lessonProgress.count({
    where: { userId: session.user.id, completed: true, lessonId: { in: allLessonIds } },
  });
  if (completedCount < allLessonIds.length) {
    return NextResponse.json({ message: "Complete all lessons first." }, { status: 400 });
  }

  // Every module with a quiz must have a passing attempt; average the scores for the final score
  const quizModules = modules.filter(m => m.quiz);
  const scores: number[] = [];
  for (const m of quizModules) {
    const latest = m.quiz!.attempts[0];
    if (!latest || !latest.passed) {
      return NextResponse.json({ message: `Pass the quiz for "${m.title}" first.` }, { status: 400 });
    }
    scores.push(latest.score);
  }
  const finalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;

  const code = `HV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  const cert = await prisma.certificate.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    create: { userId: session.user.id, courseId, code, finalScore },
    update: {},
    include: { course: { select: { title: true } } },
  });

  return NextResponse.json(cert, { status: 201 });
}