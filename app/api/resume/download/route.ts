import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const filename = searchParams.get("filename") || "Resume.pdf";

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Only allow Cloudinary URLs
    if (!url.includes("cloudinary.com")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}