// ============================================================================
//  DESTINATION:  app/api/register/route.ts   (replaces existing)
// ============================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendEmailAsync } from "@/lib/sendEmail";
import { welcomeEmail } from "@/lib/emailTemplates";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Without this, someone can script thousands of accounts. Each one is a
    // real row plus a real outbound email, so it's both a data problem and a
    // fast way to get your new Titan domain flagged as a spam source.
    const limit = await checkRateLimit(`register:${ip}`, 5, 60 * 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many sign-ups from this network. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      firstName, lastName, email, mobile, city, password,
      degree, branch, college, gradYear, cgpa, experience,
      jobType, locations, salary, skills,
    } = body;

    if (!email || !password || !firstName || !lastName || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        mobile: mobile || null,
        password: hashedPassword,
        role: "CANDIDATE",
        candidate: {
          create: {
            firstName,
            lastName,
            city,
            degree: degree || null,
            branch: branch || null,
            college: college || null,
            gradYear: gradYear || null,
            cgpa: cgpa || null,
            experience: experience || "fresher",
            jobType: jobType || null,
            locations: locations || [],
            salary: salary || null,
            skills: skills
              ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
            status: "ONBOARDING",
          },
        },
      },
      include: { candidate: true },
    });

    // Not awaited. The old version made the user wait on SMTP — one to three
    // seconds of spinner after they'd already clicked Submit, for an email they
    // haven't opened yet. sendEmail logs its own failures, so the try/catch that
    // used to wrap this is no longer needed either.
    sendEmailAsync({
      to: normalizedEmail,
      subject: "Welcome to HireVexa",
      html: welcomeEmail(firstName),
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      candidateId: user.candidate?.id,
    });
  } catch (error) {
    // A duplicate mobile number hits the unique constraint and would otherwise
    // surface as an unexplained 500 with no hint about which field is wrong.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[] | undefined)?.[0];
      return NextResponse.json(
        {
          error:
            field === "mobile"
              ? "An account with this mobile number already exists."
              : "An account with these details already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}