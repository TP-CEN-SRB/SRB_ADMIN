import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest) => {
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

    const userId = decodedToken.userId;
    const materialNames = await prisma.binMaterial.findMany({
        select:{
            name:true
        }
    });
    const disposalCounts = await Promise.all(
      materialNames.map(async (material) => {
        const count = await prisma.disposal.count({
          where: {
            userId,
            bin: {
              binMaterial: {
                name: material.name,
              },
            },
          },
        });
        return { material: material.name, count };
      })
    );

    return NextResponse.json(disposalCounts, { status: 200 });
    
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
