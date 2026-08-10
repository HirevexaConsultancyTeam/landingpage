// ============================================================================
//  DESTINATION:  app/api/jobs/create/route.ts   (replaces existing)
//  Adds applyUrl.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Validates and normalises an external apply link.
 * Returns null for empty input, throws for anything malformed.
 *
 * Checked server-side as well as in the form because the form is only a
 * convenience — a direct POST bypasses it entirely, and a junk value here
 * becomes a dead link on a live job listing.
 */
function parseApplyUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;

  const value = raw.trim();
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Apply URL must be a full link, e.g. https://example.com/job");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Apply URL must start with http:// or https://");
  }

  return value;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.company || !body.role) {
      return NextResponse.json({ error: "Company and Role are required" }, { status: 400 });
    }

    let applyUrl: string | null;
    try {
      applyUrl = parseApplyUrl(body.applyUrl);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }

    const skills =
      body.skills?.split(",").map((skill: string) => skill.trim()).filter(Boolean) || [];

    const job = await prisma.job.create({
      data: {
        company: body.company,
        role: body.role,
        location: body.location || null,
        jobType: body.jobType || null,
        experience: body.experience || null,
        salary: body.salary || null,
        skills,
        openings: Number(body.openings) || 1,
        description: body.description || null,
        applyUrl,
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}