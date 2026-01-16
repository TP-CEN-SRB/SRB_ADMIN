import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/* =======================
   GET profile info
   ======================= */
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    );

    if (decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        name: user.name,
        profile_image_url: user.profileImageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};

/* =======================
   POST profile image URL
   ======================= */
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    );

    if (decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ JSON payload (same pattern as feedback)
    const { profileImageUrl } = await req.json();

    if (!profileImageUrl) {
      return NextResponse.json(
        { message: "profileImageUrl is required" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: params.id },
      data: {
        profileImageUrl,
      },
    });

    return NextResponse.json(
      { message: "Profile image updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE PROFILE IMAGE ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};
