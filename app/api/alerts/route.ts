import { NextRequest, NextResponse } from "next/server";
import { getSmartAlerts } from "@/app/action/bin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await getSmartAlerts();

    // Safe deduplication — works even with old TS targets
    const map = new Map();
    alerts.forEach((a) => map.set(a.id, a));
    const uniqueAlerts = Array.from(map.values());

    return NextResponse.json(uniqueAlerts, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ Failed to fetch alerts API:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
