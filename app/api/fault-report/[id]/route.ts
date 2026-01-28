import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // REQUIRED for file upload

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1️⃣ JWT validation (same pattern as avatar)
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

    // 2️⃣ Fetch fault reports for this user
    const reports = await prisma.faultReport.findMany({
      where: {userId: params.id,},
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3️⃣ Return list (can be empty)
    return NextResponse.json(
      { faultReports: reports },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET FAULT REPORT ERROR:", error);
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
    // 1️⃣ JWT validation (same as avatar)
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    ) as { userId: string };

    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Read multipart form data
    const formData = await req.formData();

    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string | null;
    const file = formData.get("faultImage") as File | null;

    if (!location || !category || !type) {
      return NextResponse.json(
        { message: "Invalid fault report data" },
        { status: 400 }
      );
    }

    let faultimageUrl: string | null = null;

    // 3️⃣ Upload image if provided
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const filePath = `fault-reports/${params.id}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from("FaultImages")
        .upload(filePath, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 }
        );
      }

      const { data } = supabase.storage
        .from("FaultImages")
        .getPublicUrl(filePath);

      faultimageUrl = data.publicUrl;
    }

    // 4️⃣ Save to NeonDB
    await prisma.faultReport.create({
      data: {
        userId: params.id,
        location,
        category,
        type,
        description,
        faultimageUrl,
      },
    });

    return NextResponse.json(
      { message: "Fault report submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("FAULT REPORT API ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};
