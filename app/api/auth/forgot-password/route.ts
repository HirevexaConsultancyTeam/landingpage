// ============================================================================
//  DESTINATION:  app/api/auth/forgot-password/route.ts
//  RENAME TO: route.ts
//
//  Adds rate limiting AND closes the enumeration leak: previously an SMTP
//  failure returned 500 only for addresses that exist, so the 200-for-everyone
//  protection leaked through the error path.
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendEmail";
import { resetPasswordEmail } from "@/lib/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import crypto from "crypto";

const LIMIT = 3;
const WINDOW_SECONDS = 60 * 60;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);

    const [byEmail, byIp] = await Promise.all([
      checkRateLimit(`forgot:${normalizedEmail}`, LIMIT, WINDOW_SECONDS),
      checkRateLimit(`forgot-ip:${ip}`, 10, WINDOW_SECONDS),
    ]);

    // Same success shape as every other path — a rate-limit message here would
    // confirm the address is worth retrying.
    if (!byEmail.allowed || !byIp.allowed) {
      console.warn(`Rate limited password reset: ${normalizedEmail} from ${ip}`);
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { candidate: { select: { firstName: true } } },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });

    const BASE_URL = process.env.NEXTAUTH_URL || "https://www.hirevexaconsultancy.in";
    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
    const name = user.candidate?.firstName ?? user.email.split("@")[0];

    // Isolated so a mail failure can't change the response. Previously an SMTP
    // error produced a 500, which told an attacker the account exists — the
    // exact thing the always-200 response was there to prevent.
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Reset your HireVexa password",
        html: resetPasswordEmail(name, resetUrl),
      });
    } catch (mailError) {
      console.error("Reset email failed to send:", mailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Even on an unexpected failure, keep the response shape identical.
    return NextResponse.json({ success: true });
  }
}