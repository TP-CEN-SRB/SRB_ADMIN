import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramAlert, sendTelegramPhoto, sendTelegramPhotoWithButtons, sendTelegramWithButtons } from "@/lib/telegram";


export const runtime = "nodejs"; // REQUIRED for file upload

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1️⃣ JWT validation (same pattern as avatar)
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

    // 2️⃣ Fetch fault reports for this user
    const reports = await prisma.faultReport.findMany({
      where: {userId: params.id,},
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3️⃣ Return list (can be empty)
    return NextResponse.json(
      { faultReports: reports },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET FAULT REPORT ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // 1️⃣ JWT validation (same as avatar)
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    ) as { userId: string };

    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Read multipart form data
    const formData = await req.formData();
    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string | null;
    const file = formData.get("faultImage") as File | null;

    let faultimageUrl: string | null = null;

    // 3️⃣ image upload
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

      const { data } = supabase.storage
        .from("FaultImages")
        .getPublicUrl(filePath);

      faultimageUrl = data.publicUrl;
    } // ✅ closes if(file)

    const report = await prisma.faultReport.create({
      data: {
        userId: params.id,
        location,
        category,
        type,
        description: description || null,
        faultimageUrl,
        status: "OPEN", // ✅ if your prisma enum is OPEN/IN_PROGRESS/RESOLVED
      },
      include: {
        user: { select: { name: true, email: true } }, // optional but nice
      },
    });

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

    const msg = 
`🚨 *NEW FAULT REPORT*
🆔 Report ID: ${report.id}
👤 User: ${report.user?.name ?? "Unknown"} (${report.user?.email ?? "—"})
📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🧾 Status: ${report.status.replace("_", " ")}
🕒 ${timeSGT}

📝 ${report.description ?? "No description"}
`;

    const buttons = [
    [
      {
        text: "🛠 Take Repair Job",
        callback_data: `fault:take:${report.id}`,
      },
      {
        text: "🗑 Delete",
        callback_data: `fault:delete:${report.id}`,
      },
    ],
  ];

    try {
      if (report.faultimageUrl) {
        await sendTelegramPhotoWithButtons(
        report.faultimageUrl,
        msg,
        buttons
      );
      } else {
        await sendTelegramWithButtons(msg, buttons);
      }
    } catch (err) {
      console.error("⚠️ Telegram notification failed:", err);
    }

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
};

