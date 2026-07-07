import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Replace the 3 oldest quests with 3 new NORMAL quests.
 * This route is secured with an x-api-key header.
 */
export const PUT = async (req: NextRequest) => {
  try {
    // Step 1: Check API Key
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== "oiKWuSpfjx7NZjU85bgdx7HXPqUCIsOv8ghauPXC8b1cfAq5QLdkg7rqaUskCinuj1ebHogbqBaIgkIZ0H9U6labkVe6AmtIScQWy5YV0hGasKA43wKL2OztPMVXg9ZWndKdf1Gc9I8t2mZEOv2tDF2cbgD23x1mzYFEuTgkilczcPJSoLQYfoyw12XMhsMbuhz3FKDvipLjfSJunTogmeOJN262NmoKzBAeOk4CDJRNkAkX1QlaBfvyTVdgvg6g") {
      return NextResponse.json({ message: "Permission denied!" }, { status: 401 })
    }

    // Step 2: Delete the 3 oldest quests
    const oldestQuests = await prisma.questDetails.findMany({
      orderBy: { createdAt: "asc" },
      take: 3,
    })

    const deleted = await prisma.questDetails.deleteMany({
      where: { id: { in: oldestQuests.map((q) => q.id) } },
    })

    // Step 3: Fetch and randomly select 3 quest templates
    const templates = await prisma.questTemplate.findMany()
    if (templates.length < 3) {
      return NextResponse.json(
        { message: "Not enough templates to generate quests" },
        { status: 400 }
      )
    }

    const selectedTemplates = templates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + 7) // 1 week

    // Step 4: Fetch verified student users
    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        emailVerified: true,
      },
    })

    // Step 5: Create new NORMAL quests
    const createdQuests = await Promise.all(
      selectedTemplates.map((template) =>
        prisma.questDetails.create({
          data: {
            title: template.title,
            description: template.description,
            target: template.target,
            rewardPoints: template.rewardPoints ?? 0,
            materialType: template.materialType,
            startDate,
            endDate,
          },
        })
      )
    )

    // Step 6: Assign quests to users
    const assignments = createdQuests.flatMap((quest) =>
      users.map((user) => ({
        userId: user.id,
        questId: quest.id,
      }))
    )

    await prisma.userQuest.createMany({
      data: assignments,
      skipDuplicates: true,
    })

    return NextResponse.json(
      {
        message: `Deleted ${deleted.count} old quest(s), created and assigned 3 new NORMAL quest(s).`,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
