import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const templates = await prisma.questTemplate.findMany();

  const created = await Promise.all(
    templates.map((template) =>
      prisma.questDetails.create({
        data: {
          title: template.title,
          description: template.description,
          target: template.target,
          rewardPoints: template.rewardPoints,
          materialType: template.materialType,
        },
      })
    )
  );

  return NextResponse.json({ created: created.length });
}
