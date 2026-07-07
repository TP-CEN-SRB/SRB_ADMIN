import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Auto-delete expired quests.
 * This should be triggered daily via cron job with correct `x-api-key` header!
 */
export const DELETE = async (req: NextRequest) => {
  try {
    //Secure with API key
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== "oiKWuSpfjx7NZjU85bgdx7HXPqUCIsOv8ghauPXC8b1cfAq5QLdkg7rqaUskCinuj1ebHogbqBaIgkIZ0H9U6labkVe6AmtIScQWy5YV0hGasKA43wKL2OztPMVXg9ZWndKdf1Gc9I8t2mZEOv2tDF2cbgD23x1mzYFEuTgkilczcPJSoLQYfoyw12XMhsMbuhz3FKDvipLjfSJunTogmeOJN262NmoKzBAeOk4CDJRNkAkX1QlaBfvyTVdgvg6g") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    //Find quests that have expired (endDate < now)
    const expiredQuests = await prisma.questDetails.findMany({
      where: {
        endDate: { lt: now },
      },
      select: { id: true },
    })

    if (expiredQuests.length === 0) {
      return NextResponse.json({ message: "No expired quests to delete" }, { status: 200 })
    }

    const questIds = expiredQuests.map((q) => q.id)

    //Delete userQuest entries first (foreign key constraint)
    await prisma.userQuest.deleteMany({
      where: { questId: { in: questIds } },
    })

    //Delete the expired quests themselves
    await prisma.questDetails.deleteMany({
      where: { id: { in: questIds } },
    })

    return NextResponse.json(
      { message: `Deleted ${questIds.length} expired quests.` },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    return NextResponse.json({ message: "Unknown error" }, { status: 500 })
  }
}
