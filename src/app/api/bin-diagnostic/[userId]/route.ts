import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { handleBinDiagnostic } from "@/app/action/bin";

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

    if (!body.material) {
      return NextResponse.json(
        { error: "Missing material field. ESP32 must send { material: 'paper' }" },
        { status: 400 }
      );
    }

    // 🎯 Find the bin that belongs to this user AND this material
    const bin = await prisma.bin.findFirst({
      where: {
        userId,
        binMaterial: {
          name: body.material.toUpperCase(), // Convert paper -> PAPER
        },
      },
    });

    if (!bin) {
      return NextResponse.json(
        { error: `No bin found for userId=${userId} with material=${body.material}` },
        { status: 404 }
      );
    }

    // ✔ Use ESP timestamp only if it's an ISO string
    const timestamp =
      typeof body.timestamp === "string"
        ? body.timestamp
        : new Date().toISOString();

    const diagnosticPayload = {
      timestamp,
      results: body.results,
      deviceType: body.deviceType ?? "unknown",
    };

    // Save diagnostic log into DB
    const result = await handleBinDiagnostic(bin.id, diagnosticPayload);

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      userId,
      binId: bin.id,
      ...result,
    });
  } catch (err: any) {
    console.error("❌ bin-diagnostic route error:", err);
    return NextResponse.json(
      { error: "Diagnostic processing failed", detail: err.message },
      { status: 500 }
    );
  }
}
