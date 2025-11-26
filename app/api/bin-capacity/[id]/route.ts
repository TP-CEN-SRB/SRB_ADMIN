import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendBinWarningEmail } from "@/lib/mail";
import jwt from "jsonwebtoken";
import { Role, BinStatus } from "@prisma/client";

// ======================
// PUT — Update bin capacity
// ======================
export const PUT = async (
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
    const binManager = await prisma.user.findUnique({ where: { id } });

    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }

    const data = await req.json();

    const emailsToSend: {
      emails: string[];
      binCapacity: number;
      material: string;
      location: string;
    }[] = [];

    await prisma.$transaction(
      async (transaction) => {
        await Promise.all(
          data.map(
            async ({
              material,
              binCapacity,
            }: {
              material: string;
              binCapacity: number;
            }) => {
              const binMaterial = await transaction.binMaterial.findUnique({
                where: { name: material.toUpperCase() },
              });

              if (!binMaterial) return;

              const bin = await transaction.bin.findUnique({
                where: {
                  userId_binMaterialId_status: {
                    userId: id,
                    binMaterialId: binMaterial.id,
                    status: BinStatus.FUNCTIONAL,
                  },
                },
                include: { binMaterial: true, user: true },
              });

              if (!bin) return;

              await transaction.bin.update({
                where: { id: bin.id },
                data: { currentCapacity: parseFloat(binCapacity.toFixed(2)) },
              });

              // Send warning email if >85% for first time
              if (binCapacity > 85 && !bin.emailSent) {
                const subscriptions = await transaction.subscription.findMany({
                  where: { userId: bin.userId },
                });

                if (subscriptions.length > 0) {
                  emailsToSend.push({
                    emails: subscriptions.map((s) => s.email),
                    binCapacity,
                    material: bin.binMaterial.name,
                    location: bin.user.location as string,
                  });

                  await transaction.bin.update({
                    where: { id: bin.id },
                    data: { emailSent: true },
                  });
                }
              }

              // Reset email flag after cleared
              if (binCapacity < 85 && bin.emailSent) {
                await transaction.bin.update({
                  where: { id: bin.id },
                  data: { emailSent: false, clearCount: { increment: 1 } },
                });
              }
            }
          )
        );
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );

    await Promise.all(
      emailsToSend.map(({ emails, binCapacity, material, location }) =>
        sendBinWarningEmail(emails, binCapacity, material, location)
      )
    );

    return NextResponse.json(
      { message: "Bin capacity updated successfully!" },
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

// ======================
// GET — Fetch bin capacities with EFFECTIVE STATUS LOGIC
// ======================
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

    // Fetch ALL bins regardless of DB status
    const bins = await prisma.bin.findMany({
      where: { userId },
      include: {
        binMaterial: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const now = Date.now();

    // Apply EFFECTIVE STATUS logic locally (no need to rely on admin dashboard)
    const validBins = bins.filter((bin) => {
      const lastHB = bin.lastHeartBeat
        ? new Date(bin.lastHeartBeat).getTime()
        : 0;

      const isOnline = lastHB && now - lastHB < 10 * 60 * 1000; // heartbeat alive within 10 mins

      let effectiveStatus: "FUNCTIONAL" | "UNDER_MAINTENANCE" =
        bin.status === "FUNCTIONAL" ? "FUNCTIONAL" : "UNDER_MAINTENANCE";

      // Correct for heartbeat conditions
      if (bin.status === "FUNCTIONAL" && !isOnline) {
        effectiveStatus = "UNDER_MAINTENANCE";
      }
      if (bin.status === "UNDER_MAINTENANCE" && isOnline) {
        effectiveStatus = "FUNCTIONAL";
      }

      return effectiveStatus === "FUNCTIONAL";
    });

    const result = validBins.map((bin) => ({
      material: bin.binMaterial.name,
      percentage: bin.currentCapacity,
    }));

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 });
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
};
