// ============================================================================
//  DESTINATION:  app/api/admin/jobs/[id]/route.ts   (replaces existing)
//  Adds applyUrl to PATCH.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

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

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    let applyUrl: string | null;
    try {
      applyUrl = parseApplyUrl(body.applyUrl);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }

    const skills =
      body.skills?.split(",").map((skill: string) => skill.trim()).filter(Boolean) || [];

    const job = await prisma.job.update({
      where: { id },
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
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Refuse to delete a job people have applied to — the applications cascade
    // away with it and your client loses the record that they ever happened.
    // Deactivating keeps the history.
    const job = await prisma.job.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job._count.applications > 0) {
      return NextResponse.json(
        {
          error: `This job has ${job._count.applications} application(s). Deactivate it instead of deleting.`,
        },
        { status: 400 }
      );
    }

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}