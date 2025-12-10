import { NextResponse } from "next/server";
import { handleBinDiagnostic } from "@/app/action/bin";

export async function POST(
  req: Request,
  { params }: { params: { binId: string } }
) {
  try {
    const binId = params.binId;

    if (!binId) {
      return NextResponse.json(
        { error: "Missing binId in URL" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body || !Array.isArray(body.results)) {
      return NextResponse.json(
        { error: "Invalid diagnostic payload — results[] must be an array" },
        { status: 400 }
      );
    }

    // ✔ Correct timestamp handling:
    // If ESP32 sent a raw millis() → backend will fallback to server time
    const timestamp =
      typeof body.timestamp === "string"
        ? body.timestamp
        : new Date().toISOString();

    const diagnosticPayload = {
      timestamp,
      results: body.results,
      deviceType: body.deviceType ?? "unknown"
    };

    const response = await handleBinDiagnostic(binId, diagnosticPayload);

    return NextResponse.json({
      ok: true,
      binId,
      ...response
    });
  } catch (err) {
    console.error("❌ Diagnostic API error:", err);
    return NextResponse.json(
      { error: "Diagnostic processing failed" },
      { status: 500 }
    );
  }
}
