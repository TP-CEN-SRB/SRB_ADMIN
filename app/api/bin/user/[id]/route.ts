import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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
    const binManagerId = params.id;
    const searchParams = req.nextUrl.searchParams;
    const material = searchParams.get("material");
    const bins = await prisma.bin.findMany({
      where: {
        userId: binManagerId,
        ...(material && {
          binMaterial: {
            name: material.toUpperCase(),
          },
        }),
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
    if (bins.length === 0) {
      return NextResponse.json({ message: "No bin found!" }, { status: 404 });
    }
    return NextResponse.json(
      { bins },
      {
        status: 200,
      }
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
