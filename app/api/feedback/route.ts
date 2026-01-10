import { NextRequest, NextResponse } from "next/server";
import { FeedbackSchema } from "@/schemas";
import prisma from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Verify user
    const user = await verifyJwt(req);

    // 2️⃣ Parse body
    const body = await req.json();

    // 3️⃣ Validate input
    const data = FeedbackSchema.parse(body);

    // 4️⃣ Save to DB
    await prisma.feedback.create({
      data: {
        userId: user.id,
        rating: data.rating,
        category: data.category,
        message: data.message,
        faculty: data.faculty,
        binId: data.binId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback POST error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
