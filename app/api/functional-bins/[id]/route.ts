import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
/**
 *  Retrieves an array of bin materials that are functional
 *  This API is required for the smart bin to check which bin capacities should be updated periodically
 */
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
    const binManager = await prisma.user.findUnique({ where: { id: id } });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager is not found!" },
        { status: 404 }
      );
    }
    const bins = await prisma.bin.findMany({
      where: { userId: binManager.id, status: "FUNCTIONAL" },
      select: { binMaterial: { select: { name: true } } },
    });
    const binMaterials = bins.map((bin) => bin.binMaterial.name);

    return NextResponse.json({ binMaterials }, { status: 200 });
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
