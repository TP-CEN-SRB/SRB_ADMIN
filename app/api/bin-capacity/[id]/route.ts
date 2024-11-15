import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }
    const id = params.id;
    const material = req.nextUrl.searchParams.get("material");
    if (!id || !material) {
      return NextResponse.json(
        { message: "Missing ID or Material parameter" },
        { status: 400 }
      );
    }
    const bin = await prisma.bin.findFirst({
      where: { userId: id, binMaterial: { name: material.toUpperCase() } },
      select: { currentCapacity: true },
    });
    if (!bin || bin.currentCapacity === null) {
      return NextResponse.json({ message: "No bin found" }, { status: 404 });
    }
    return NextResponse.json(
      { currentCapacity: bin.currentCapacity },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
