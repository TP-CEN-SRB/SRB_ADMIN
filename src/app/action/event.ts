"use server"

import { prisma } from "@/lib/db"
import { authClient } from "@/lib/auth-client"
import { EventSchema, UpdateEventSchema } from "@/schemas"
import { z } from "zod"
import { cached, invalidateByPrefix, CATALOG_TTL } from "@/lib/cache"

const CACHE_PREFIX = "cache:events:"

// Event type for returned fields (can also be imported from Prisma)
type Event = {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  createdAt: Date
}

type GetEventsResult = {
  events: Event[]
  eventCount: number
}

export const createEvent = async (data: z.infer<typeof EventSchema>) => {

  const { data: session } = await authClient.getSession()
  const user = session?.user

  if (user?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    })

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        emailVerified: true,
      },
      select: { id: true },
    })

    const userEvents = students.map((u) => ({
      userId: u.id,
      eventId: event.id,
      points: 0,
    }))

    await prisma.userEvent.createMany({
      data: userEvents,
      skipDuplicates: true,
    })

    await invalidateByPrefix(CACHE_PREFIX)
    return { success: "Event created and assigned to all students", event }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create event" }
  }
}

export const updateEvent = async (
  id: string,
  data: z.infer<typeof UpdateEventSchema>
) => {
  const { data: session } = await authClient.getSession()
  const user = session?.user
  if (user?.role !== "admin") return { error: "Unauthorized" }

  try {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        updatedAt: new Date(),
      },
    })

    await invalidateByPrefix(CACHE_PREFIX)
    return { success: "Event updated successfully", event: updated }
  } catch (error) {
    const err = error as Error
    return { error: err.message || "Failed to update event" }
  }
}

export const deleteEvent = async (eventId: string) => {
  const { data: session } = await authClient.getSession()
  const user = session?.user
  if (user?.role !== "admin") return { error: "Unauthorized" }

  try {
    await prisma.event.delete({ where: { id: eventId } })
    await invalidateByPrefix(CACHE_PREFIX)
    return { success: "Event deleted successfully" }
  } catch (error) {
    const err = error as Error
    return { error: err.message || "Failed to delete event" }
  }
}

export const getEventById = async (id: string) => {
  return cached(`${CACHE_PREFIX}${id}`, CATALOG_TTL, () =>
    prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    })
  )
}

type UserInEvent = {
  points: number
  user: {
    id: string
    name: string | null
    email: string
    faculty: string
  }
}

export const getUsersByEventId = async (eventId: string): Promise<UserInEvent[]> => {
  const { data: session } = await authClient.getSession()
  const user = session?.user
  if (user?.role !== "admin") return []

  const userEvents = await prisma.userEvent.findMany({
    where: { eventId },
    select: {
      points: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          faculty: true,
        },
      },
    },
  })

  return userEvents
}

export const getEvents = async (
  page: number | null,
  sortOrder: string | undefined,
  sortItem: string | undefined
): Promise<GetEventsResult> => {
  const { data: session } = await authClient.getSession()
  const user = session?.user
  if (user?.role !== "admin") return { eventCount: 0, events: [] }

  const sortableItems = ["title", "startDate", "endDate", "createdAt"]
  const isInvalidPage = page != null && page < 0
  const isInvalidSortOrder = sortOrder && !["asc", "desc"].includes(sortOrder)
  const isInvalidSortItem = sortItem && !sortableItems.includes(sortItem)

  if (isInvalidPage || isInvalidSortOrder || isInvalidSortItem) {
    return { eventCount: 0, events: [] }
  }

  return cached(
    `${CACHE_PREFIX}list:${page}:${sortOrder}:${sortItem}`,
    CATALOG_TTL,
    async () => {
      const [eventCount, events] = await Promise.all([
        prisma.event.count(),
        prisma.event.findMany({
          take: page ? 10 : undefined,
          skip: page ? (page - 1) * 10 : 0,
          orderBy: sortItem
            ? { [sortItem]: sortOrder === "asc" ? "asc" : "desc" }
            : { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
        }),
      ])

      return { eventCount, events }
    }
  )
}
