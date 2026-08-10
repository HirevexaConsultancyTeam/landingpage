// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // delete CREATED orders older than 24h before returning the list
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.order.deleteMany({
    where: { status: "CREATED", createdAt: { lt: cutoff } },
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      course: { select: { title: true, slug: true } },
    },
  });

  return NextResponse.json(orders);
}