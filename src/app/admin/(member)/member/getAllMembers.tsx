"use server"
import { prisma } from "@/lib/db"

const LIMIT = 20

export async function getAllMembers(page: number){
  const skip = (page - 1) * LIMIT
  const allMember = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "STUDENT", "STAFF"]
      }
    },
    orderBy: {
      createdAt: "asc",
    },
    skip: skip,
    take: LIMIT,
    include: {
      point: true 
    }
  })

  const allMemberCount = await prisma.user.count({
    where: {
      role: {
        in: ["ADMIN", "STUDENT", "STAFF"]
      }
    }
  })

  const totalPages = Math.ceil(allMemberCount / LIMIT)

  return {allMember, allMemberCount, totalPages} 
}