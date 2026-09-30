import { NextResponse } from "next/server";

export const ACCESS_LOCK_MESSAGE =
  "Course access is temporarily unavailable. Please contact HireVexa support.";

/** Locked unless COURSE_ACCESS_LOCKED is explicitly set to "false". */
export function isAccessLocked(): boolean {
  return process.env.COURSE_ACCESS_LOCKED !== "false";
}

type SessionLike = { user?: { id?: string | null; role?: unknown } | null } | null | undefined;

export function isAdminSession(session: SessionLike): boolean {
  const role = (session?.user as { role?: unknown } | undefined)?.role;
  return typeof role === "string" && role.toUpperCase() === "ADMIN";
}

/** True when this session must be blocked from course/module content. */
export function isBlocked(session: SessionLike): boolean {
  return isAccessLocked() && !isAdminSession(session);
}

/** Returns a 423 response if blocked, otherwise null. */
export function courseAccessBlocked(session: SessionLike): NextResponse | null {
  if (!isBlocked(session)) return null;
  return NextResponse.json({ message: ACCESS_LOCK_MESSAGE, locked: true }, { status: 423 });
}