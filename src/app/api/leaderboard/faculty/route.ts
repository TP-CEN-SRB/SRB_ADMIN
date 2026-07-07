import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { Role } from "@/generated/prisma"

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      )
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      )
    }

    // Date range for current month
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)

    // Step 1: Get all distinct faculties from students
    const allFaculties = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: { faculty: true },
      distinct: ["faculty"],
    })

    // Step 2: Get disposal data this month with user (faculty) info
    const allDisposals = await prisma.disposal.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        user: {
          role: Role.STUDENT,
        },
      },
      include: {
        user: {
          select: {
            faculty: true,
          },
        },
      },
    })

    // Step 3: Initialize all faculties with 0 points and 0 disposal count
    const facultyStats = new Map<string, { points: number; disposalCount: number }>()
    for (const { faculty } of allFaculties) {
      if (faculty) {
        facultyStats.set(faculty, { points: 0, disposalCount: 0 })
      }
    }

    // Step 4: Accumulate disposal data
    for (const disposal of allDisposals) {
      const faculty = disposal.user?.faculty
      if (!faculty) continue

      const stats = facultyStats.get(faculty) || { points: 0, disposalCount: 0 }
      stats.points += disposal.pointsAwarded
      stats.disposalCount += 1
      facultyStats.set(faculty, stats)
    }

    // Step 5: Format and sort descending by points
    const rankedFaculties = Array.from(facultyStats.entries())
      .map(([faculty, stats]) => ({
        faculty,
        points: stats.points,
        disposalCount: stats.disposalCount,
      }))
      .sort((a, b) => b.points - a.points)

    return NextResponse.json({ facultyLeaderboard: rankedFaculties }, { status: 200 })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 })
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 })
  }
}
