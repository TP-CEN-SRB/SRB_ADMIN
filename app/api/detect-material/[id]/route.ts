/**
 * Polling
 */
// import { getSessionUser } from "@/utils/getAuth";
// import { NextRequest, NextResponse } from "next/server";
// const storedData: Record<
//   string,
//   { material: string; weightInGrams: number; thrown: boolean }
// > = {};
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
//     const { material, weightInGrams, thrown } = storedData[id];
//     delete storedData[id];
//     return NextResponse.json(
//       { material, weightInGrams, thrown },
//       { status: 200 }
//     );
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

// export const POST = async (
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
//     const { material, weightInGrams, thrown } = await req.json();
//     const id = params.id;
//     if (!id) {
//       return NextResponse.json(
//         { message: "Missing ID parameter" },
//         { status: 400 }
//       );
//     }
//     storedData[id] = { material, weightInGrams, thrown };
//     return NextResponse.json(
//       { message: "Material details received" },
//       { status: 200 }
//     );
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
import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import prisma from "@/lib/db";
export const POST = async (
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
    if (!id) {
      return NextResponse.json(
        { message: "Missing ID parameter" },
        { status: 400 }
      );
    }
    const binUser = await prisma.user.findUnique({ where: { id: id } });
    if (!binUser) {
      return NextResponse.json(
        { message: "Bin user is not found!" },
        { status: 404 }
      );
    }
    const { material, weightInGrams, thrown, binCapacity } = await req.json();
    await pusherServer.trigger(
      `detect-material-${params.id}`,
      "material-details",
      {
        material,
        weightInGrams,
        thrown,
        binCapacity,
      }
    );
    return NextResponse.json(
      { message: "Material details received" },
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
