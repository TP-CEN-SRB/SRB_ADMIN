import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
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
    if (!id) {
      return NextResponse.json(
        { message: "Missing ID parameter" },
        { status: 400 }
      );
    }
    const { material } = await req.json();
    const binMaterial = await prisma.binMaterial.findUnique({
      where: { name: material.toUpperCase() },
    });
    if (!binMaterial) {
      return NextResponse.json(
        { message: "Bin material is not found!" },
        { status: 404 }
      );
    }
    const binUser = await prisma.user.findUnique({
      where: { id: id },
      include: {
        bins: {
          where: { binMaterialId: binMaterial.id },
        },
      },
    });
    if (!binUser) {
      return NextResponse.json(
        { message: "No relevant bin found!" },
        { status: 404 }
      );
    }
    await prisma.bin.update({
      where: {
        userId_binMaterialId: {
          userId: binUser.id,
          binMaterialId: binMaterial.id,
        },
      },
      data: { currentCapacity: 0 },
    });
    return NextResponse.json(
      { message: "Bin emptied successfully!" },
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
