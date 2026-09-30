import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { courseAccessBlocked } from "@/lib/access-lock";

interface Params {
  params: Promise<{ slug: string }>;
}

// GET /api/courses/[slug]
// Blocked for everyone except admin while the access lock is on.
// When unlocked, it is public and never returns lesson videos unless isPreview.
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const blocked = courseAccessBlocked(session);
    if (blocked) return blocked;

    const { slug } = await params;

    const course = await prisma.course.findUnique({
      where: { slug, published: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        modules: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            summary: true,
            icon: true,
            order: true,
            slug: true,
            isFinalExam: true,
            quiz: { select: { id: true } },
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                durationMinutes: true,
                isPreview: true,
                order: true,
                videoUrl: true, // stripped below unless isPreview
              },
            },
          },
        },
        reviews: {
          take: 6,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { email: true } } },
        },
        _count: { select: { enrollments: true, reviews: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }

    const safe = {
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        hasQuiz: Boolean(m.quiz),
        quiz: undefined,
        lessons: m.lessons.map((l) => ({
          ...l,
          videoUrl: l.isPreview ? l.videoUrl : null,
        })),
      })),
    };

    return NextResponse.json(safe);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch course." }, { status: 500 });
  }
}