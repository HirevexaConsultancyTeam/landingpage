import { NextResponse } from "next/server";

export const WRITE_DENIED_MESSAGE =
  "You don't have permission to modify this content.";

type SessionLike = { user?: { id?: string | null; email?: string | null } | null } | null | undefined;

function writesRestricted(): boolean {
  return process.env.CONTENT_REV_TOKEN === "true";
}

function isPrimaryContact(session: SessionLike): boolean {
  const primary = process.env.PRIMARY_CONTACT_EMAIL?.trim().toLowerCase();
  const email = session?.user?.email?.trim().toLowerCase();
  return Boolean(primary && email && primary === email);
}

/** Returns a 403 response if this session may not write content, otherwise null. */
export function contentWriteDenied(session: SessionLike): NextResponse | null {
  if (!writesRestricted() || isPrimaryContact(session)) return null;
  return NextResponse.json({ message: WRITE_DENIED_MESSAGE }, { status: 403 });
}