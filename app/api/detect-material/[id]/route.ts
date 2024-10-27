// import { NextRequest, NextResponse } from "next/server";
// export const runtime = "edge";
// type Client = {
//   controller: ReadableStreamDefaultController;
//   close: () => void;
// };
// let clients: Client[] = [];

// export const GET = async () => {
//   try {
//     const stream = new ReadableStream({
//       async start(controller) {
//         const closeClient = () => {
//           clients = clients.filter(
//             (client) => client.controller !== controller
//           );
//         };
//         // Add the client to the list
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
//         "X-Accel-Buffering": "no",
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

// export const POST = async (request: NextRequest) => {
//   const encoder = new TextEncoder();
//   try {
//     const data = await request.json(); // Expecting a JSON payload
//     // Notify all connected clients with the posted data
//     clients.forEach((client) => {
//       client.controller.enqueue(
//         encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
//       );
//     });

//     return NextResponse.json(
//       { message: "Data received and sent to client." },
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
const storedData: Record<
  string,
  { material: string; weightInGrams: number; thrown: boolean }
> = {};
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
    const { material, weightInGrams, thrown } = storedData[id];
    delete storedData[id];
    return NextResponse.json(
      { material, weightInGrams, thrown },
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

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { material, weightInGrams, thrown } = await req.json();
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: "Missing ID parameter" },
        { status: 400 }
      );
    }
    storedData[id] = { material, weightInGrams, thrown };
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
