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
let storedMaterial: string | undefined; // Variable to store the material
let storedWeightInGrams: number | undefined;
export const GET = async (req: NextRequest) => {
  try {
    if (storedMaterial === "" || storedMaterial === undefined) {
      return NextResponse.json(
        { message: "No material detected" },
        { status: 404 }
      );
    }
    if (storedWeightInGrams == 0 || storedWeightInGrams === undefined) {
      return NextResponse.json(
        { message: "Missing weight of material" },
        { status: 404 }
      );
    }
    const material = storedMaterial;
    const weightInGrams = storedWeightInGrams;
    storedMaterial = "";
    storedWeightInGrams = 0;
    return NextResponse.json({ material, weightInGrams }, { status: 200 });
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
export const POST = async (req: NextRequest) => {
  try {
    const { material, weightInGrams } = await req.json();
    if (!material) {
      return NextResponse.json(
        { message: "No material detected" },
        { status: 404 }
      );
    }
    if (!weightInGrams) {
      return NextResponse.json(
        { message: "Missing weight of material" },
        { status: 404 }
      );
    }
    storedMaterial = material;
    storedWeightInGrams = weightInGrams;
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
