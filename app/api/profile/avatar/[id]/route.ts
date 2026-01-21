import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // REQUIRED for file upload

// Supabase client (server-side only)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1️⃣ JWT validation
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    );

    if (typeof decoded === "string" || decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Fetch profile image URL from NeonDB
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        profileImageUrl: true,
      },
    });

    // 3️⃣ Return URL (even if null)
    return NextResponse.json(
      {
        profile_image_url: user?.profileImageUrl ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PROFILE AVATAR ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1️⃣ JWT (COPIED from feedback)
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    );

    if (typeof decoded === "string" || decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Read multipart form data
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No avatar file provided" },
        { status: 400 }
      );
    }

    // 3️⃣ Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `${params.id}.jpg`;

    // 4️⃣ Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("Avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { message: "Image upload failed" },
        { status: 500 }
      );
    }

    // 5️⃣ Get public URL
    const { data } = supabase.storage
      .from("Avatars")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // 6️⃣ Update user profileImageUrl in Neon DB
    await prisma.user.update({
      where: { id: params.id },
      data: {
        profileImageUrl: publicUrl,
      },
    });

    return NextResponse.json(
      { profile_image_url: publicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("PROFILE AVATAR API ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};