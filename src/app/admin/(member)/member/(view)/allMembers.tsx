"use server"
import { prisma } from "@/lib/db"

export type Role = "ADMIN" | "STUDENT" | "STAFF"
export type Faculty = "ENG" | "BUS" | "DES" | "ASC" | "IIT" | "HSS" | "EXT" | "OTHERS"
export type Sort = "asc" | "desc" | undefined

export async function getAllMembers(
  page: number, 
  limit: number, 
  roles: Role[], 
  faculty: Faculty[], 
  sort: Sort[],
  email: string
  )
  {

  const whereClause = {
    role: {
      in: roles
    },
    faculty: {
      in: faculty
    },
    email: {
      contains: email
    }
  }

  const allMember = await prisma.user.findMany({

    skip: (page - 1) * limit,
    take: limit,
    where: whereClause,
    orderBy: {
      createdAt: sort[0],
      name: sort[1]
    },

    include: {
      point: true 
    }
  })

  const allMemberCount = await prisma.user.count({
    where: whereClause
  })

  const totalPages = Math.ceil(allMemberCount / limit)

  return {allMember, allMemberCount, totalPages} 
}