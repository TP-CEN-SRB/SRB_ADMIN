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
    const bin = await prisma.bin.findUnique({
      where: {
        userId_binMaterialId_status: {
          userId: id,
          binMaterialId: binMaterial.id,
          status: "FUNCTIONAL",
        },
      },
    });
    if (!bin) {
      return NextResponse.json(
        { message: "No relevant bin found!" },
        { status: 404 }
      );
    }
    await prisma.bin.update({
      where: {
        id: bin.id,
        emailSent: false,
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
