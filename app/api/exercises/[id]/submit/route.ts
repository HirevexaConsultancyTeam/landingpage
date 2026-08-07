// ============================================================================
//  DESTINATION:  app/api/exercises/[id]/submit/route.ts
//  RENAME THIS FILE TO:  route.ts
//
//  Note the FULL path — three folders: exercises / [id] / submit
//  A 404 on POST /api/exercises/<id>/submit means this file is not at that
//  exact path. Restart the dev server after adding it.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessModule } from "@/lib/progress";

const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * POST /api/exercises/[id]/submit
 * Body: { response: number | number[] | string | boolean | null }
 *
 * Returns whether the answer was right, plus the hint, solution and
 * explanation — all withheld by the content route until this point.
 *
 * CODING drills can't be auto-graded (no Python sandbox on the server), so they
 * come back as `selfAssessed: true` with the reference solution and the student
 * marks their own work.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: exerciseId } = await params;

  // Tolerate an empty or malformed body rather than throwing a 500.
  let response: unknown = null;
  try {
    const body = await req.json();
    response = body?.response ?? null;
  } catch {
    response = null;
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { lesson: { select: { moduleId: true } } },
  });
  if (!exercise) {
    return NextResponse.json({ message: "Drill not found." }, { status: 404 });
  }

  const access = await canAccessModule(userId, exercise.lesson.moduleId);
  if (!access.ok) {
    const status = access.reason === "NOT_FOUND" ? 404 : 403;
    return NextResponse.json({ message: "This drill isn't available yet." }, { status });
  }

  const payload = (exercise.payload ?? {}) as Record<string, unknown>;
  let isCorrect = false;
  let selfAssessed = false;

  switch (exercise.type) {
    case "MULTIPLE_SELECT": {
      const expected = ((payload.correctIndexes as number[]) ?? []).slice().sort((a, b) => a - b);
      const picked = Array.isArray(response)
        ? [...new Set(response as number[])].sort((a, b) => a - b)
        : [];
      isCorrect = picked.length === expected.length && picked.every((v, i) => v === expected[i]);
      break;
    }
    case "TRUE_FALSE": {
      isCorrect = response === (payload.correct as boolean);
      break;
    }
    case "FILL_BLANK":
    case "SHORT_ANSWER": {
      const acceptable = ((payload.acceptable as string[]) ?? []).map(normalise);
      const given = typeof response === "string" ? normalise(response) : "";
      isCorrect = given.length > 0 && acceptable.includes(given);
      break;
    }
    case "CODING": {
      selfAssessed = true;
      isCorrect = response === true;
      break;
    }
    case "MCQ":
    case "OUTPUT_PREDICTION":
    default: {
      isCorrect = response === (payload.correctIndex as number);
      break;
    }
  }

  await prisma.exerciseAttempt.create({
    data: { userId, exerciseId, response: { value: response as never }, isCorrect },
  });

  return NextResponse.json({
    isCorrect,
    selfAssessed,
    hint: exercise.hint,
    solution: exercise.solution,
    explanation: exercise.explanation,
    expectedOutput: exercise.expectedOutput,
  });
}