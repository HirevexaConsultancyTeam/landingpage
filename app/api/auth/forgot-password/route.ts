// ============================================================================
//  DESTINATION:  app/api/auth/forgot-password/route.ts   (replaces existing)
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendEmail";
import { resetPasswordEmail } from "@/lib/emailTemplates";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { candidate: { select: { firstName: true } } },
    });

    // Unknown address gets the same 200 as a known one, so the response can't
    // be used to enumerate registered users.
    if (!user) {
      return NextResponse.json({ success: true });
    }

    await prisma.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const BASE_URL = process.env.NEXTAUTH_URL ?? "https://www.hirevexaconsultancy.in";
    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
    const name = user.candidate?.firstName ?? user.email.split("@")[0];

    // Awaited rather than fire-and-forget: this is the one email the user is
    // actively waiting on. But sendEmail returns false instead of throwing, so
    // a failure still can't change the response shape and reopen the
    // enumeration leak.
    const ok = await sendEmail({
      to: normalizedEmail,
      subject: "Reset your HireVexa password",
      html: resetPasswordEmail(name, resetUrl),
    });

    if (!ok) {
      console.error(`[reset] token created for ${normalizedEmail} but email failed to send`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Identical response even on an unexpected failure. Previously a 500 here
    // told an attacker the account exists, since unknown addresses returned 200
    // before ever reaching the mail step.
    return NextResponse.json({ success: true });
  }
}