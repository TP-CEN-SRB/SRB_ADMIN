import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // 1️⃣ JWT
    const { id } = await params; 

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string" || decoded.userId !== id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Body
    const { rating, category, message } = await req.json();

    if (!rating || !category) {
      return NextResponse.json(
        { message: "Invalid feedback data" },
        { status: 400 }
      );
    }

    // 3️⃣ Save feedback
    await prisma.feedback.create({
      data: {
        userId: id,
        rating,
        category,
        message,
      },
    });

    return NextResponse.json(
      { message: "Feedback submitted" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};
