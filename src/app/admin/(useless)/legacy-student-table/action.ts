"use server"

import { prisma } from "@/lib/db"
import { Faculty } from "@/generated/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getAllStudentUsers(
  page: number | null,
  query: string | null,
  sortOrder: string | undefined,
  sortItem: string | undefined,
  emailType: string | null,
  faculty: string | null
){
  const sessionData = await auth.api.getSession({
    headers: await headers()
  })

  const sessionUser = sessionData?.user
  if (!sessionUser || sessionUser.role !== "admin") {
    return { error: "Unauthorized access!" }
  }
  const sortableItems = ["disposal", "point", "redemption"]
  const allowedEmailTypes = ["verified", "non-verified"]
  const pageCondition = page != null && page < 0
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc"
  const sortItemCondition =
    sortItem !== undefined && !Object.values(sortableItems).includes(sortItem)
  const emailTypeCondition =
    emailType &&
    !emailType.split(",").every((type) => allowedEmailTypes.includes(type))
  const facultyCondition =
    faculty &&
    !faculty
      .split(",")
      .every((f) => Object.values(Faculty).includes(f as Faculty))

  // check if all conditions are met
  if (
    pageCondition ||
    sortItemCondition ||
    sortOrderCondition ||
    emailTypeCondition ||
    facultyCondition
  ) {
    return { studentCount: 0, students: [] }
  }
  const isVerifiedSelected = emailType?.split(",").includes(allowedEmailTypes[0]); // "verified"
  const isNonVerifiedSelected = emailType?.split(",").includes(allowedEmailTypes[1]); // "non-verified"

  // Determine the boolean filter
  // If both or neither are selected, we want all users (undefined)
  // If only "verified" is selected, we want true
  // If only "non-verified" is selected, we want false
  const emailVerifiedFilter = (isVerifiedSelected && isNonVerifiedSelected) || (!isVerifiedSelected && !isNonVerifiedSelected)
    ? undefined
    : isVerifiedSelected
    ? true
    : false;
  const [studentCount, students] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        OR: query
          ? [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ] : undefined,
        emailVerified: emailVerifiedFilter, // 👈 Clean and simple
      faculty: faculty ? { in: faculty.split(",") as Faculty[] } : undefined,
    },
  }),
  prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: query ? [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ] : undefined,
        emailVerified: emailVerifiedFilter, // 👈 Same filter here
        faculty: faculty ? { in: faculty.split(",") as Faculty[] } : undefined,
      },
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy:
        sortItem === sortableItems[0]
          ? { disposals: { _count: sortOrder } }
          : sortItem === sortableItems[1]
          ? { point: { balance: sortOrder } }
          : sortItem === sortableItems[2]
          ? { redemptions: { _count: sortOrder } }
          : { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        faculty: true,
        profileImageUrl: true,
        point: { select: { balance: true, updatedAt: true } },
        _count: { select: { disposals: true, redemptions: true } },
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])
  return { studentCount, students }
}
