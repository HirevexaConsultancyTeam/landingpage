 import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      file.type !== "application/msword"
    ) {
      return NextResponse.json(
        {
          error: "Only PDF/DOC/DOCX allowed",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<any>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "raw",
              folder: "hirevexa/resumes",
              public_id: `${session.user.id}-${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      }
    );

    const candidate =
      await prisma.candidate.findUnique({
        where: {
          userId: session.user.id,
        },
      });

    if (!candidate) {
      return NextResponse.json(
        {
          error: "Candidate not found",
        },
        {
          status: 404,
        }
      );
    }

   await prisma.candidate.update({
  where: {
    id: candidate.id,
  },
  data: {
    resumeUrl: uploaded.secure_url,
  },
});

const existingResume = await prisma.document.findFirst({
  where: {
    candidateId: candidate.id,
    type: "Resume",
  },
});

if (existingResume) {
  await prisma.document.update({
    where: {
      id: existingResume.id,
    },
    data: {
      name: file.name,
      url: uploaded.secure_url,
      status: "APPROVED",
    },
  });
} else {
  await prisma.document.create({
    data: {
      candidateId: candidate.id,
      name: file.name,
      type: "Resume",
      url: uploaded.secure_url,
      status: "APPROVED",
    },
  });
}

    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}