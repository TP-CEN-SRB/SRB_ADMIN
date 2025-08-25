import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });

    const q = await prisma.disposalQueue.create({ data: {} });
    return NextResponse.json({ queueId: q.id }, { status: 201 });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) return NextResponse.json({ message: "Token has expired!" }, { status: 401 });
    if (e instanceof jwt.JsonWebTokenError) return NextResponse.json({ message: "Token is invalid!" }, { status: 401 });
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
};
