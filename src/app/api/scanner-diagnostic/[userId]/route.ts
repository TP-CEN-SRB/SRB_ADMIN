import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; 

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in URL" },
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

    const { results } = body;

    // Extract failed components
    const failedComponents = results.filter((r: any) => r.status === "failed");

    const scannerOK = failedComponents.length === 0;

    // REQUIRED: scanner overall status
    const overallStatus = scannerOK ? "FUNCTIONAL" : "UNDER_MAINTENANCE";

    // Correct timestamp usage
    const timestamp =
      typeof body.timestamp === "string"
        ? new Date(body.timestamp)
        : new Date();

    // Save scanner diagnostic log
    await prisma.scannerDiagnosticLog.create({
      data: {
        userId,
        timestamp,
        scannerOK,               // ⭐ REQUIRED
        overallStatus,
        details: {
          allComponents: results,
          failedComponents
        }
      }
    });

    return NextResponse.json({
      ok: true,
      userId,
      scannerOK,
      failedComponents
    });
  } catch (err: any) {
    console.error("❌ Scanner Diagnostic API error:", err);
    return NextResponse.json(
      { error: "Diagnostic processing failed", detail: err.message },
      { status: 500 }
    );
  }
}
