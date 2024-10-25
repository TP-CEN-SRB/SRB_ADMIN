import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";
type Client = {
  controller: ReadableStreamDefaultController;
  close: () => void;
};
let clients: Client[] = [];

export const GET = async () => {
  const encoder = new TextEncoder();
  try {
    const stream = new ReadableStream({
      start(controller) {
        const closeClient = () => {
          clients = clients.filter(
            (client) => client.controller !== controller
          );
        };
        // Add the client to the list
        clients.push({ controller, close: closeClient });

        const keepAliveInterval = setInterval(() => {
          if (controller.desiredSize === 0) {
            clearInterval(keepAliveInterval);
            closeClient();
          } else {
            // Send keep-alive message to prevent closing the connection
            controller.enqueue(encoder.encode(`:\n\n`));
          }
        }, 15000); // Adjust the interval based on Vercel’s timeout behavior
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
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

export const POST = async (request: NextRequest) => {
  try {
    const encoder = new TextEncoder();
    const data = await request.json(); // Expecting a JSON payload
    // Notify all connected clients with the posted data
    clients.forEach((client) => {
      client.controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
      );
    });

    return NextResponse.json(
      { message: "Data received and sent to client." },
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
