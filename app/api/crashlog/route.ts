import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    await prisma.crashlog.create({ data: { message } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Crashlog error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
};
