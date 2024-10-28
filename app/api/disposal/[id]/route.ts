/*
 * SSE
 */

// import prisma from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";
// export const runtime = "nodejs";
// export const revalidate = 0;
// type Client = {
//   controller: ReadableStreamDefaultController;
//   close: () => void;
// };
// let clients: Client[] = [];

// export const PUT = async (req: NextRequest) => {
//   const encoder = new TextEncoder();
//   try {
//     const { disposalId, userId } = await req.json();
//     if (!disposalId) {
//       return NextResponse.json(
//         { message: "Missing fields: [disposalId]" },
//         { status: 400 }
//       );
//     }
//     if (!userId) {
//       return NextResponse.json(
//         { message: "Missing fields: [userId]" },
//         { status: 400 }
//       );
//     }
//     const result = await prisma.disposal.findUnique({
//       where: { id: disposalId, isScanned: false },
//     });
//     if (!result) {
//       return NextResponse.json(
//         { message: "No disposal found" },
//         { status: 404 }
//       );
//     }
//     const existingUser = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//     });
//     if (!existingUser) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }
//     await prisma.disposal.update({
//       where: { id: disposalId },
//       data: {
//         userId: userId,
//         isScanned: true,
//       },
//     });
//     clients.forEach((client) => {
//       client.controller.enqueue(
//         encoder.encode(`data: ${JSON.stringify({ updated: true })}\n\n`)
//       );
//     });
//     return NextResponse.json({ message: "Updated disposal" }, { status: 201 });
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json({ message: error.message }, { status: 500 });
//     }
//   }
//   return NextResponse.json(
//     { message: "An unknown error occurred" },
//     { status: 500 }
//   );
// };

// export const GET = async () => {
//   const encoder = new TextEncoder();
//   try {
//     const stream = new ReadableStream({
//       async start(controller) {
//         const closeClient = () => {
//           clients = clients.filter(
//             (client) => client.controller !== controller
//           );
//         };
//         clients.push({ controller, close: closeClient });

//         const interval = setInterval(() => {
//           if (controller.desiredSize === 0) {
//             closeClient();
//             clearInterval(interval);
//           }
//         }, 1000);
//       },
//     });

//     return new NextResponse(stream, {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
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

/*
 * Polling
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
const storedData: Record<string, { updated: boolean }> = {};
export const runtime = "nodejs";

// needed for to allow other domain to send put request
function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
export const OPTIONS = () => {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
};

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = params.id;
    if (!id || !storedData[id]) {
      return NextResponse.json(
        { message: "No data found for this ID" },
        { status: 404 }
      );
    }
    const { updated } = storedData[id];
    delete storedData[id];
    return NextResponse.json({ updated }, { status: 200 });
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
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
    const result = await prisma.disposal.findFirst({
      where: { id: disposalId, isScanned: false },
    });
    if (!result) {
      return NextResponse.json(
        { message: "No disposal found" },
        { status: 404 }
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
      where: { id: disposalId },
      data: {
        userId: userId,
        isScanned: true,
      },
    });
    storedData[id] = { updated: true };
    return NextResponse.json({ message: "Updated disposal" }, { status: 201 });
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
