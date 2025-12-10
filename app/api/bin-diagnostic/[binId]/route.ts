import { NextResponse } from "next/server";
import { handleBinDiagnostic } from "@/app/action/bin";

export async function POST(req: Request, { params }: { params: { binId: string } }) {
  try {
    const binId = params.binId;
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    // Extract timestamp + results safely
    const timestamp = body.timestamp ?? new Date().toISOString();
    const results = body.results ?? {};

    const diagnosticPayload = {
      timestamp,
      results,
    };

    const response = await handleBinDiagnostic(binId, diagnosticPayload);

    return NextResponse.json({ ok: true, ...response });
  } catch (err) {
    console.error("Diagnostic API error:", err);
    return NextResponse.json({ error: "Diagnostic processing failed" }, { status: 500 });
  }
}
