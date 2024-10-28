import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { location, status, material } = await request.json();
  console.log(location, status, material);
  try {
    const result = await prisma.bin.create({
      data: { location, status, material },
    });

    // Return JSON response directly with success message
    return NextResponse.json(
      { success: `Bin created successfully, id: ${result.id}` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error:
              "A bin with the same location, status, and material already exists.",
          },
          { status: 409 }
        );
      }
    }
    // Return JSON response directly with error message
    return NextResponse.json(
      { error: "Failed to create bin." },
      { status: 500 }
    );
  }
};
