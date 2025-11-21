import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const range = searchParams.get("range") || "hour";

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });
    }

    // 🕒 Set time window
    const since = new Date();
    if (range === "hour") since.setHours(since.getHours() - 1);
    else if (range === "month") since.setDate(since.getDate() - 30);
    else if (range === "year") since.setFullYear(since.getFullYear() - 1);

    // Find all bins owned by this manager
    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      select: { id: true, binMaterial: { select: { name: true } } },
    });

    const results = await Promise.all(
      bins.map(async (bin) => {
        // Fetch uptime logs within range
        const logs = await prisma.binUptimeLog.findMany({
          where: {
            binId: bin.id,
            timestamp: { gte: since },
          },
          select: { status: true },
        });

        if (logs.length === 0) return { id: bin.id, name: bin.binMaterial.name, uptime: 0 };

        const functionalCount = logs.filter((l) => l.status === "FUNCTIONAL").length;
        const uptimePercent = Math.round((functionalCount / logs.length) * 100);

        return {
          id: bin.id,
          name: bin.binMaterial.name,
          uptime: uptimePercent,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Error fetching uptime logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch uptime logs" },
      { status: 500 }
    );
  }
}
