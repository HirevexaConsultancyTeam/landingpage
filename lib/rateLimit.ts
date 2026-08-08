
// ============================================================================
//  DESTINATION:  lib/rateLimit.ts   (new file)
// ============================================================================
import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limiter backed by the database.
 *
 * A fixed window lets through up to 2x the limit across a window boundary — a
 * sliding window would be stricter. That tradeoff is deliberate: this exists to
 * stop credential stuffing at thousands of attempts, and the difference between
 * 5 and 10 attempts per window is irrelevant at that scale. Correctness across
 * serverless instances matters far more, which is why it's in Postgres.
 *
 * Fails OPEN: if the database is unreachable, requests are allowed through.
 * Locking every user out of login because the rate-limit table had a hiccup is
 * a worse outcome than briefly losing throttling.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    // No record, or the window has passed — start a fresh window.
    if (!existing || existing.expiresAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      });
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
    }

    if (existing.count >= limit) {
      const retryAfter = Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(retryAfter, 1) };
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      remaining: Math.max(limit - updated.count, 0),
      retryAfterSeconds: 0,
    };
  } catch (error) {
    console.error("Rate limit check failed, allowing request:", error);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** Clears the counter — call after a successful login so honest users aren't punished. */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.deleteMany({ where: { key } });
  } catch {
    // Non-fatal.
  }
}

/**
 * Best-effort client IP.
 *
 * On Vercel, x-forwarded-for is set by the platform and can't be spoofed by the
 * client. Behind a different proxy this may be attacker-controlled, so IP is
 * only ever used ALONGSIDE another key (like email), never as the sole limit.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}