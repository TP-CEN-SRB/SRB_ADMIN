import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
        const userId = params.id;
        if (decodedToken.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized access" },
                { status: 401 }
            );
        }

        const point = await prisma.point.findUnique({
            where: { userId: userId },
        });

        if (!point) {
            return NextResponse.json(
                { message: "Points not found for user" },
                { status: 404 }
            );
        }

        // Return the point balance
        return NextResponse.json(
            { point: `${point.balance}` },
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
}

