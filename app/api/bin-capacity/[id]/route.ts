import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendBinWarningEmail } from "@/lib/mail";

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
                    status: "FUNCTIONAL",
                  },
                },
                include: { binMaterial: true, user: true },
              });

              if (!bin) return;

              await transaction.bin.update({
                where: { id: bin.id },
                data: { currentCapacity: parseFloat(binCapacity.toFixed(2)) },
              });

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

// 🆕 GET method to fetch bin capacity for IdleVideo
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;

    const bins = await prisma.bin.findMany({
      where: {
        userId: id,
        status: "FUNCTIONAL",
      },
      include: {
        binMaterial: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const result = bins.map((bin) => ({
      material: bin.binMaterial.name,
      percentage: bin.currentCapacity,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to get bin capacities" },
      { status: 500 }
    );
  }
};
