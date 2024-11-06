/*
 * Polling
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import { pusherServer } from "@/lib/pusher";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

// needed for to allow other domain to send put request
// function setCorsHeaders(response: NextResponse) {
//   response.headers.set("Access-Control-Allow-Origin", "*");
//   response.headers.set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
//   response.headers.set("Access-Control-Allow-Headers", "Content-Type");
//   return response;
// }
// export const OPTIONS = () => {
//   const response = new NextResponse(null, { status: 204 });
//   return setCorsHeaders(response);
// };
// const storedData: Record<string, { updated: boolean }> = {};
// export const GET = async (
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) => {
//   try {
//     const user = await getSessionUser();
//     if (!user) {
//       return NextResponse.json(
//         { message: "User not authenticated" },
//         { status: 401 }
//       );
//     }
//     const id = params.id;
//     if (!id || !storedData[id]) {
//       return NextResponse.json(
//         { message: "No data found for this ID" },
//         { status: 404 }
//       );
//     }
//     const { updated } = storedData[id];
//     delete storedData[id];
//     return NextResponse.json({ updated }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json({ message: error.message }, { status: 500 });
//     }
//     return NextResponse.json(
//       { message: "An unknown error occurred" },
//       { status: 500 }
//     );
//   }
// };

// export const PUT = async (
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) => {
//   try {
//     const authorization = req.headers.get("x-api-key");
//     if (authorization !== process.env.API_KEY) {
//       return NextResponse.json(
//         { message: "Permission denied!" },
//         { status: 401 }
//       );
//     }
//     const { disposalId, userId } = await req.json();
//     const id = params.id;
//     if (!id) {
//       return NextResponse.json(
//         { message: "Missing ID parameter" },
//         { status: 400 }
//       );
//     }
//     if (!disposalId || !userId) {
//       return NextResponse.json(
//         {
//           message: `Missing fields: ${!disposalId ? "[disposalId]" : ""} ${
//             !userId ? "[userId]" : ""
//           }`,
//         },
//         { status: 400 }
//       );
//     }
//     const result = await prisma.disposal.findFirst({
//       where: { id: disposalId, isScanned: false },
//     });
//     if (!result) {
//       return NextResponse.json(
//         { message: "No disposal found" },
//         { status: 404 }
//       );
//     }
//     const existingUser = await prisma.user.findFirst({
//       where: {
//         id: userId,
//         role: "USER",
//       },
//     });
//     if (!existingUser) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }
//     const updatedDisposal = await prisma.disposal.update({
//       where: { id: disposalId },
//       data: {
//         user: {
//           connect: {
//             id: userId,
//           },
//         },
//         isScanned: true,
//       },
//     });
//     const transaction = await prisma.transaction.create({
//       data: {
//         pointsChange: updatedDisposal.weightInGrams,
//         user: {
//           connect: {
//             id: userId,
//           },
//         },
//       },
//     });
//     const point = await prisma.point.findFirst({
//       where: {
//         userId: transaction.userId,
//       },
//     });
//     if (!point) {
//       await prisma.point.create({
//         data: {
//           user: {
//             connect: {
//               id: transaction.userId,
//             },
//           },
//         },
//       });
//     }
//     const userPoint = await prisma.point.update({
//       where: {
//         userId: transaction.userId,
//       },
//       data: {
//         balance: {
//           increment: transaction.pointsChange,
//         },
//       },
//     });
//     storedData[id] = { updated: true };
//     return NextResponse.json({ message: "Updated disposal" }, { status: 201 });
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json({ message: error.message }, { status: 500 });
//     }
//     return NextResponse.json(
//       { message: "An unknown error occurred" },
//       { status: 500 }
//     );
//   }
// };

export const PUT = async (
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
    try {
      const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { message: "Unauthorized access!" },
          { status: 401 }
        );
      }
    }
    const { disposalId, userId } = await req.json();
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: "Missing ID parameter" },
        { status: 400 }
      );
    }
    if (!disposalId || !userId) {
      return NextResponse.json(
        {
          message: `Missing fields: ${!disposalId ? "[disposalId]" : ""} ${
            !userId ? "[userId]" : ""
          }`,
        },
        { status: 400 }
      );
    }
    const disposal = await prisma.disposal.findFirst({
      where: { id: disposalId, isRedeemed: false },
    });
    if (!disposal) {
      return NextResponse.json(
        { message: "No disposal found" },
        { status: 404 }
      );
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "STUDENT",
      },
    });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const [updatedDisposal, userPoint] = await prisma.$transaction([
      prisma.disposal.update({
        where: { id: disposalId },
        data: {
          userId: userId,
          isRedeemed: true,
        },
      }),
      prisma.point.upsert({
        where: { userId: userId },
        update: { balance: { increment: disposal.pointsAwarded } },
        create: {
          userId,
          balance: disposal.pointsAwarded,
        },
      }),
    ]);
    await pusherServer.trigger(`disposal-qr-${params.id}`, "disposal-update", {
      updated: true,
    });
    return NextResponse.json({ message: "Updated disposal" }, { status: 200 });
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
