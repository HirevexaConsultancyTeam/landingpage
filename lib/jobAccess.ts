// ============================================================================
//  DESTINATION:  lib/jobAccess.ts   (replaces the version from the jobs work)
//  Only change: applyUrl is now stripped along with the other gated fields.
// ============================================================================
import { prisma } from "@/lib/prisma";
import type { Job } from "@prisma/client";

export type PublicJob = Omit<Job, "salary" | "description" | "skills" | "applyUrl"> & {
  salary: string | null;
  description: string | null;
  skills: string[];
  applyUrl: string | null;
  locked: boolean;
};

export async function canViewFullJob(userId?: string | null): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { registrationPaid: true, role: true },
  });
  if (!user) return false;

  if (user.role === "ADMIN" || user.role === "COUNSELLOR") return true;

  return user.registrationPaid;
}

/**
 * Strips gated fields when the viewer hasn't registered.
 *
 * `applyUrl` is included in the strip. Leaving it public would let anyone browse
 * the listings, collect the company links and apply directly — the registration
 * fee would gate nothing that matters.
 */
export function sanitiseJob(job: Job, canViewFull: boolean): PublicJob {
  if (canViewFull) {
    return { ...job, locked: false };
  }

  return {
    ...job,
    salary: null,
    description: null,
    skills: [],
    applyUrl: null,
    locked: true,
  };
}