import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import {
  sendTelegramPhotoWithButtons,
  sendTelegramWithButtons,
} from "@/lib/telegram";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* =========================
   GET – MOBILE APP
   ========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded: any = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    );

    if (typeof decoded === "string" || decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ BigInt-safe, minimal fields
    const reports = await prisma.faultReport.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        location: true,
        category: true,
        type: true,
        description: true,
        faultimageUrl: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ faultReports: reports }, { status: 200 });
  } catch (error) {
    console.error("GET FAULT REPORT ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

/* =========================
   POST – CREATE FAULT
   ========================= */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    ) as { userId: string };

    if (decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string | null;
    const file = formData.get("faultImage") as File | null;

    let faultimageUrl: string | null = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const filePath = `fault-reports/${params.id}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("FaultImages")
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
        });

      if (error) {
        return NextResponse.json(
          { message: "Image upload failed" },
          { status: 500 }
        );
      }

      faultimageUrl = supabase.storage
        .from("FaultImages")
        .getPublicUrl(filePath).data.publicUrl;
    }

    const report = await prisma.faultReport.create({
      data: {
        userId: params.id,
        location,
        category,
        type,
        description: description || null,
        faultimageUrl,
        status: "OPEN",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

/* ---------- Telegram (NON-BLOCKING) ---------- */
void (async () => {
  try {
    const timeSGT =
      new Date().toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        hour12: false,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }) + " SGT";

    const msg = `🚨 NEW FAULT REPORT

🆔 Report ID: ${report.id}

👤 User: ${report.user?.name ?? "Unknown"} (${report.user?.email ?? ""})
📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🧾 Status: ${report.status}
🕒 ${timeSGT}

📝 Description: ${report.description ?? "No description"}`;

    const buttons = [
      [
        { text: "🛠 Take Repair", callback_data: `fault:take:${report.id}` },
        { text: "🗑 Delete", callback_data: `fault:delete:${report.id}` },
      ],
    ];

    let tgRes;

    if (report.faultimageUrl) {
      tgRes = await sendTelegramPhotoWithButtons(
        report.faultimageUrl,
        msg,
        buttons
      );
    } else {
      tgRes = await sendTelegramWithButtons(msg, buttons);
    }

    const telegramMessageId = tgRes?.result?.message_id;

    if (telegramMessageId) {
      await prisma.faultReport.update({
        where: { id: report.id },
        data: { telegramMessageId },
      });
    }
  } catch (err) {
    console.error("⚠️ Telegram notification failed:", err);
  }
})();

    return NextResponse.json(
      { message: "Fault report submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("FAULT REPORT API ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}