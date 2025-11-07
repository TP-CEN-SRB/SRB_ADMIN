import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSmartAlerts } from "@/app/action/bin";

export async function GET() {
  try {
    const alerts = await getSmartAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("❌ Failed to fetch alerts API:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
