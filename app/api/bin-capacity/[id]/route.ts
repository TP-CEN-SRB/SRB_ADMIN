import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendBinWarningEmail } from "@/lib/mail";
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
    const binManagerId = params.id;
    if (decodedToken.userId !== binManagerId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }
    const bins = await prisma.bin.findMany({
      where: {
        userId: binManagerId,
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
    return NextResponse.json({ bins }, { status: 200 });
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
    const binManager = await prisma.user.findUnique({ where: { id: id } });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }

    /**
     * Expects an array as follows
     * [
     *   { "material": "MATERIAL", "binCapacity": VALUE },
     * ]
     */
    const data = await req.json();

    // Array of warning emails to send if the capacity > 85
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

              if (!binMaterial) {
                throw new Error(`Bin material: ${material} is not found!`);
              }

              const bin = await transaction.bin.findUnique({
                where: {
                  userId_binMaterialId_status: {
                    userId: id,
                    binMaterialId: binMaterial.id,
                    status: "FUNCTIONAL",
                  },
                },
                include: { binMaterial: true, user: true },
              });

              if (!bin) {
                throw new Error(
                  `No functional bin found for material: ${material}!`
                );
              }

              // Update the bin's capacity
              await transaction.bin.update({
                where: { id: bin.id },
                data: { currentCapacity: parseFloat(binCapacity.toFixed(2)) },
              });

              // Populate the email array if bin is almost full and warning email has not been sent
              if (binCapacity > 85 && !bin.emailSent) {
                const subscriptions = await transaction.subscription.findMany({
                  where: { userId: bin.userId },
                });

                if (subscriptions.length > 0) {
                  emailsToSend.push({
                    emails: subscriptions.map(
                      (subscription) => subscription.email
                    ),
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

              // Clear the email flag if bin is cleared and warning email was sent previously
              if (binCapacity < 85 && bin.emailSent) {
                await transaction.bin.update({
                  where: { id: bin.id },
                  data: { emailSent: false },
                });
              }
            }
          )
        );
      },
      {
        maxWait: 5000, // 5 seconds max wait to connect to prisma
        timeout: 20000, // 20 seconds
      }
    );

    // Send emails outside the transaction
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
