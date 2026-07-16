"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { TransactionType } from "@/generated/prisma"

const getTransactionByUserId = async (
  userId: string,
  page: number | null,
  sortOrder: string | undefined,
  transactionType: string | null
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const sessionUser = session?.user
  if (!sessionUser || sessionUser?.role !== "admin") {
    return { error: "Unauthorized access!" }
  }
  const pageCondition = page != null && page < 0
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc"
  const transactionTypeCondition =
    transactionType &&
    !transactionType
      .split(",")
      .every((type) =>
        Object.values(TransactionType).includes(type as TransactionType)
      )

  // check if all conditions are met
  if (pageCondition || sortOrderCondition || transactionTypeCondition) {
    return { transactionCount: 0, transactions: [] }
  }
  const [transactionCount, transactions, user] = await Promise.all([
    prisma.transaction.count({
      where: {
        transactionType: transactionType
          ? { in: transactionType.split(",") as TransactionType[] }
          : undefined,
        userId: userId,
      },
    }),
    prisma.transaction.findMany({
      where: {
        transactionType: transactionType
          ? { in: transactionType.split(",") as TransactionType[] }
          : undefined,
        userId: userId,
      },
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy: { createdAt: sortOrder === "asc" ? "asc" : "desc" },
      select: {
        id: true,
        user: { select: { name: true } },
        pointsChange: true,
        description: true,
        transactionType: true,
        createdAt: true,
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ])
  return { transactionCount, transactions, user }
}

export { getTransactionByUserId }
