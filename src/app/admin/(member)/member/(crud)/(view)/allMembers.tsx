"use server"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type Role = "admin" | "STUDENT" | "STAFF"
export type Faculty = "ENG" | "BUS" | "DES" | "ASC" | "IIT" | "HSS" | "EXT" | "OTHERS"
export type Sort = "asc" | "desc" | undefined

export async function getAllMembers(
  page: number,
  limit: number,
  roles: Role[],
  faculty: Faculty[],
  sort: Sort[],
  search: string
  )
  {

  const whereClause = {
    role: {
      in: roles
    },
    faculty: {
      in: faculty
    },
    OR: search
      ? [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ]
      : undefined,
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

export async function deleteMember(id: string){
  try{
    await prisma.user.delete({
      where: { id },
    })

    revalidatePath("/admin/member")
    return { success: true }

  } catch(error){
    return { success: false, error: "Failed to delete member" }
  }
}