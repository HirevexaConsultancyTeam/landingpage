import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { courseId } = await params;
  const completed = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true, lesson: { module: { courseId } } },
    select: { lessonId: true },
  });

  const map: Record<string, boolean> = {};
  completed.forEach(c => { map[c.lessonId] = true; });
  return NextResponse.json(map);
}