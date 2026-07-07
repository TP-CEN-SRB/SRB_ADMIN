import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json(feedbacks)
}