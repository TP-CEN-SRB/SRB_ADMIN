import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" },{ status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!) as { userId: string };
    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" },{ status: 401 });
    }

    const { location, category, type, description, faultimageUrl } = await req.json();

    if (!location || !category || !type) {
      return NextResponse.json(
        { message: "Invalid fault report data" },
        { status: 400 }
      );
    }

    await prisma.faultReport.create({
      data: {
        userId: params.id,
        location,
        category,
        type,
        faultimageUrl,
        description,
      },
    });

    // 5️⃣ Success response
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