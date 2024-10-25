import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge";
type Client = {
  controller: ReadableStreamDefaultController;
  close: () => void;
};
let clients: Client[] = [];

export const GET = async () => {
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

        const interval = setInterval(() => {
          if (controller.desiredSize === 0) {
            closeClient();
            clearInterval(interval);
          }
        }, 1000);
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
    const data = await request.json(); // Expecting a JSON payload
    // Notify all connected clients with the posted data
    clients.forEach((client) => {
      client.controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
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
