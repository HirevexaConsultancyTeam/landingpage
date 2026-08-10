// app/api/test-email/route.ts

import { NextResponse } from "next/server";
import { verifyEmailConnection } from "@/lib/nodemailer";

export async function GET() {
  const result = await verifyEmailConnection();

  return NextResponse.json({
    success: result,
  });
}