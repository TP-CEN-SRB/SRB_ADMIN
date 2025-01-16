import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";

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
    const date = new Date();
    const firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayofMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const data = await prisma.disposal.groupBy({
      by: ["userId", "pointsAwarded"],
      where: {
        user: {
          role: "STUDENT" as Role,
        },
        createdAt: {
          gte: firstDayofMonth,
          lte: lastDayofMonth,
        },
      },
      _sum: {
        pointsAwarded: true,
      },
      orderBy: {
        _sum: { pointsAwarded: "desc" },
      },
      take: 10,
    });
    const userIds = data
      .map((user) => user.userId)
      .filter((id): id is string => id !== null); // Extract the user IDs in order

    const userDisposals = await prisma.disposal.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds,
        },
      },
    });

    // const userRedemptions = await prisma.redemption.groupBy({
    //   by: ["userId"],
    //   _count: {
    //     id: true,
    //   },
    //   where: {
    //     userId: {
    //       in: userIds,
    //     },
    //   },
    // });
    const orderedDisposals = await Promise.all(
      userIds.map(async (userId) => {
        const disposal = userDisposals.find((d) => d.userId === userId);
        const name = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            name: true,
            email: true,
          },
        });
        return {
          userId: userId,
          rank: userIds.indexOf(userId) + 1,
          username: name?.name || null,
          adminNo: name?.email.split("@")[0].toUpperCase() || null,
          points:
            data.find((d) => d.userId === userId)?._sum.pointsAwarded || 0, // Include balance or 0 if no balance
          disposalCount: disposal ? disposal._count.id : 0, // Include count or 0 if no disposals
          // redemptionCount:
          //   userRedemptions.find((r) => r.userId === userId)?._count.id || 0,
        };
      })
    );

    return NextResponse.json({ orderedDisposals }, { status: 200 });
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

// export const GET = async (req: NextRequest) => {
//   try {
//     const token = req.headers.get("Authorization")?.split(" ")[1];
//     if (!token) {
//       return NextResponse.json(
//         { message: "Missing authorization header!" },
//         { status: 401 }
//       );
//     }

//     const secretKey = process.env.NEXT_JWT_SECRET_KEY;
//     if (!secretKey) {
//       return NextResponse.json(
//         { message: "JWT secret key is not set!" },
//         { status: 500 }
//       );
//     }

//     const decodedToken = jwt.verify(token, secretKey);

//     const date = new Date();
//     const firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//     const lastDayofMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

//     console.log("First Day of Month:", firstDayofMonth);
//     console.log("Last Day of Month:", lastDayofMonth);

//     const data = await prisma.disposal.groupBy({
//       by: ["userId", "pointsAwarded"],
//       where: {
//         user: { role: "STUDENT" as Role },
//         createdAt: { gte: firstDayofMonth, lte: lastDayofMonth },
//       },
//       _sum: { pointsAwarded: true },
//       orderBy: { _sum: { pointsAwarded: "desc" } },
//       take: 50,
//     });

//     const userIds = data
//       .map((user) => user.userId)
//       .filter((id): id is string => id !== null);

//     const userDisposals = await prisma.disposal.groupBy({
//       by: ["userId"],
//       _count: {
//         id: true,
//       },
//       where: {
//         userId: {
//           in: userIds,
//         },
//       },
//     });

//     const userRedemptions = await prisma.redemption.groupBy({
//       by: ["userId"],
//       _count: {
//         id: true,
//       },
//       where: {
//         userId: {
//           in: userIds,
//         },
//       },
//     });

//     const test = await prisma.disposal.findMany({
//       include: {
//         user: {
//           select: {
//             id: true,
//           },
//         },
//         bin: {
//           include: {
//             binMaterial: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     //map the array of data to its corresponding user id
//     const orderedDisposals = await Promise.all(
//       userIds.map(async (userId) => {
//         const disposal = userDisposals.find((d) => d.userId === userId) || {
//           _count: { id: 0 },
//         };
//         const name = await prisma.user.findUnique({
//           where: { id: userId },
//           select: {
//             name: true,
//             email: true,
//           },
//         });

//         const userTestData = test.filter((t) => t.user?.id === userId);

//         const materialCounts = userTestData.reduce((acc, item) => {
//           const materialName = item.bin?.binMaterial?.name;
//           if (materialName) {
//             acc[materialName] = (acc[materialName] || 0) + 1;
//           }
//           return acc;
//         }, {} as Record<string, number>);

//         const mostFrequentMaterial = Object.keys(materialCounts).reduce(
//           (maxMaterial, material) =>
//             materialCounts[material] > (materialCounts[maxMaterial] || 0)
//               ? material
//               : maxMaterial,
//           ""
//         );

//         return {
//           rank: userIds.indexOf(userId) + 1,
//           username: name?.name || null,
//           adminNo: name?.email?.split("@")[0].toUpperCase() || null,
//           points:
//             data.find((d) => d.userId === userId)?._sum.pointsAwarded || 0,
//           disposalCount: disposal._count.id,
//           redemptionCount:
//             userRedemptions.find((r) => r.userId === userId)?._count?.id || 0,
//           mostFrequentMaterial: mostFrequentMaterial || null,
//         };
//       })
//     );

//     return NextResponse.json({ orderedDisposals }, { status: 200 });
//   } catch (error) {
//     console.error("Error occurred:", error);

//     // Handle JWT errors specifically
//     if (error instanceof jwt.TokenExpiredError) {
//       return NextResponse.json(
//         { message: "Token has expired!" },
//         { status: 401 }
//       );
//     } else if (error instanceof jwt.JsonWebTokenError) {
//       return NextResponse.json(
//         { message: "Token is invalid!" },
//         { status: 401 }
//       );
//     }

//     // Return generic server error with logs for debugging
//     return NextResponse.json(
//       {
//         message: "An unknown error occurred",
//       },
//       { status: 500 }
//     );
//   }
// };
