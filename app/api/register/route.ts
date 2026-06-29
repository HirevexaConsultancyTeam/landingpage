import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";
import { welcomeEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, mobile, city, password,
      degree, branch, college, gradYear, cgpa, experience,
      jobType, locations, salary, skills,
    } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize email — always lowercase + trimmed
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

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
            city: city || null,
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

    // Send welcome email
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to HireVexa 🚀",
        html: welcomeEmail(firstName),
      });
      console.log("Welcome email sent.");
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Registration still succeeds even if email fails
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      candidateId: user.candidate?.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}