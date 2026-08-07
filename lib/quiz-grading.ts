import type { QuizQuestion } from "@prisma/client";

export type SubmittedAnswer = number | number[] | string | boolean | null;

const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Grades one answer against one question.
 *
 * `correctOptions` is canonical. When it's empty we fall back to
 * `[correctOption]`, so questions authored through the old admin UI — which only
 * ever wrote the single-index field — keep grading correctly.
 */
export function isAnswerCorrect(q: QuizQuestion, submitted: SubmittedAnswer): boolean {
  if (submitted === null || submitted === undefined) return false;

  const correct = q.correctOptions.length > 0 ? q.correctOptions : [q.correctOption];

  switch (q.type) {
    case "MULTIPLE_SELECT": {
      if (!Array.isArray(submitted)) return false;
      const picked = [...new Set(submitted as number[])].sort((a, b) => a - b);
      const expected = [...new Set(correct)].sort((a, b) => a - b);
      return (
        picked.length === expected.length && picked.every((v, i) => v === expected[i])
      );
    }

    case "FILL_BLANK":
    case "SHORT_ANSWER": {
      if (typeof submitted !== "string") return false;
      const given = normalise(submitted);
      if (given.length === 0) return false;
      return q.acceptableAnswers.some((a) => normalise(a) === given);
    }

    case "TRUE_FALSE": {
      // Stored as options ["True", "False"], so index 0 = True, 1 = False.
      const idx =
        typeof submitted === "boolean" ? (submitted ? 0 : 1) : (submitted as number);
      return correct.includes(idx);
    }

    case "MCQ":
    case "OUTPUT_PREDICTION":
    default:
      return typeof submitted === "number" && correct.includes(submitted);
  }
}

/** Fisher–Yates. Used to sample the bank without bias toward early questions. */
export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}