import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Client = {
  controller: ReadableStreamDefaultController<any>;
  close: () => void;
};
let clients: Client[] = [];

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const result = await prisma.disposal.findUnique({
      where: { id: params.id, isScanned: false },
    });
    if (!result) {
      return NextResponse.json(
        { message: "No disposal found" },
        { status: 404 }
      );
    }
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { message: "Missing fields: [userId]" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    await prisma.disposal.update({
      where: { id: params.id },
      data: {
        userId: userId,
        isScanned: true,
      },
    });

    return NextResponse.json({ message: "Updated disposal" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
  return NextResponse.json(
    { message: "An unknown error occurred" },
    { status: 500 }
  );
};
