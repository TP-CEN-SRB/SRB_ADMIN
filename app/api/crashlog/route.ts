import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") throw new Error("Invalid token");

    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });

    await prisma.crashlog.create({ data: { message } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Crashlog error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
};
