import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const key of ["type", "prompt", "payload", "order"] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  for (const key of ["hint", "solution", "explanation", "starterCode", "expectedOutput"] as const) {
    if (body[key] !== undefined) data[key] = body[key]?.trim() || null;
  }

  const updated = await prisma.exercise.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;
  await prisma.exercise.delete({ where: { id } });
  return NextResponse.json({ message: "Drill deleted." });
}