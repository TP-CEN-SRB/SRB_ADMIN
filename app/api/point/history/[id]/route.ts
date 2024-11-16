import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = async (
    req: NextRequest,
    { params }: { params: { id: string } }
) => {
    try {
        // Extract the JWT token from the Authorization header
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { message: "Missing authorization header!" },
                { status: 401 }
            );
        }

        // Verify the JWT token
        const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
        if (typeof decodedToken === "string") {
            return NextResponse.json(
                { message: "Unauthorized access!" },
                { status: 401 }
            );
        }

        const userId = params.id;

        // Check if the token's userId matches the requested userId
        if (decodedToken.userId !== userId) {
            return NextResponse.json(
                { message: "Unauthorized access" },
                { status: 401 }
            );
        }

        // Fetch the disposal history
        const disposals = await prisma.disposal.findMany({
            where: { userId },
            select: {
                id: true,
                pointsAwarded: true,
                weightInGrams: true,
                createdAt: true,
            },
        });

        // Fetch the redemption history with associated reward details
        const redemptions = await prisma.redemption.findMany({
            where: { userId },
            include: {
                reward: {
                    select: {
                        name: true,
                        pointsRequired: true,
                        description: true,
                        image: true,
                    },
                },
            },
        });

        // Map disposal history to a common format
        const disposalHistory = disposals.map((disposal) => ({
            id: disposal.id,
            type: "DISPOSAL",
            points: disposal.pointsAwarded,
            description: `Points awarded for disposal (${disposal.weightInGrams} grams)`,
            date: disposal.createdAt,
        }));

        // Map redemption history to a common format
        const redemptionHistory = redemptions.map((redemption) => ({
            id: redemption.id,
            type: "REDEMPTION",
            points: -redemption.reward.pointsRequired,
            description: `Redeemed reward: ${redemption.reward.name}`,
            // date: redemption.createdAt,  
            reward: {
                name: redemption.reward.name,
                description: redemption.reward.description,
                image: redemption.reward.image,
            },
        }));

        // Combine disposal and redemption history
        const pointsHistory = [...disposalHistory, ...redemptionHistory].sort(
            // (a, b) => a.date.getTime() - b.date.getTime()
        );

        // Return the combined history
        return NextResponse.json({ history: pointsHistory }, { status: 200 });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json(
                { message: "Token has expired!" },
                { status: 401 }
            );
        } else if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: "Token is invalid!" }, { status: 401 });
        }

        // Handle any other unknown errors
        return NextResponse.json(
            { message: "An unknown error occurred" },
            { status: 500 }
        );
    }
};
