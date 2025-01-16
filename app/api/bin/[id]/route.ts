import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }
    const binManagerId = params.id;
    if (decodedToken.userId !== binManagerId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }
    const searchParams = req.nextUrl.searchParams;
    const material = searchParams.get("material");
    if (!material) {
      return NextResponse.json(
        { message: "Bin material is required!" },
        { status: 400 }
      );
    }
    const bin = await prisma.bin.findFirst({
      where: {
        binMaterial: {
          name: material.toUpperCase(),
        },
        userId: binManagerId,
      },
      select: {
        status: true,
        currentCapacity: true,
        binMaterial: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!bin) {
      return NextResponse.json({ message: "No bin found!" }, { status: 404 });
    }
    return NextResponse.json({ bin }, { status: 200 });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token has expired!" },
        { status: 401 }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Token is invalid!" },
        { status: 401 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
