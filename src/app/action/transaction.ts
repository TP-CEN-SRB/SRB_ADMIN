"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { TransactionType } from "@/generated/prisma"

const getTransactionByUserId = async (
  userId: string,
  page: number | null,
  sortOrder: string | undefined,
  transactionType: string | null,
  limit: number = 10
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
    return { transactionCount: 0, transactions: [], totalPages: 1 }
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
      take: page ? limit : undefined,
      skip: page ? (page - 1) * limit : 0,
      orderBy: { createdAt: sortOrder === "asc" ? "asc" : "desc" },
      select: {
        id: true,
        user: { select: { name: true } },
        pointsChange: true,
        description: true,
        transactionType: true,
        queueId: true,
        weightInGrams: true,
        carbonSaved: true,
        createdAt: true,
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ])
  return {
    transactionCount,
    transactions,
    user,
    totalPages: Math.max(1, Math.ceil(transactionCount / limit)),
  }
}

const getAllTransactions = async (
  page: number,
  limit: number,
  sortOrder: string | undefined,
  transactionType: string | null,
  search: string
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const sessionUser = session?.user
  if (!sessionUser || sessionUser?.role !== "admin") {
    return { transactionCount: 0, transactions: [], totalPages: 1 }
  }

  const transactionTypeCondition =
    transactionType &&
    !transactionType
      .split(",")
      .every((type) =>
        Object.values(TransactionType).includes(type as TransactionType)
      )

  if (transactionTypeCondition) {
    return { transactionCount: 0, transactions: [], totalPages: 1 }
  }

  const whereClause = {
    transactionType: transactionType
      ? { in: transactionType.split(",") as TransactionType[] }
      : undefined,
    user: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined,
  }

  const [transactionCount, transactions] = await Promise.all([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.findMany({
      where: whereClause,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: sortOrder === "asc" ? "asc" : "desc" },
      select: {
        id: true,
        user: { select: { id: true, name: true, email: true } },
        pointsChange: true,
        description: true,
        transactionType: true,
        queueId: true,
        createdAt: true,
      },
    }),
  ])

  return {
    transactionCount,
    transactions,
    totalPages: Math.max(1, Math.ceil(transactionCount / limit)),
  }
}

export { getTransactionByUserId, getAllTransactions }
