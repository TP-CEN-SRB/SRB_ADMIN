import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { publishMqtt } from "@/lib/mqtt"

/**
 * Re-publish every power schedule from the database as a retained MQTT
 * message.
 *
 * Why this exists: the relay/servo Pi only ever learns its schedule from the
 * retained message on srb/schedule. If the broker loses that message - a
 * broker restart, or session/retain expiry on the HiveMQ free tier - the Pi
 * comes back with no schedule at all. power_servo.py's is_power_on_now()
 * fails safe to "always on" in that case, so the bin silently never powers
 * down and nothing anywhere reports an error.
 *
 * That happened on 2026-08-07: the service restarted, the retained srb/power
 * override was redelivered but srb/schedule was gone, and the 18:10 shutdown
 * never fired.
 *
 * The database is the source of truth, so replaying it on a timer makes the
 * retained message self-healing: a lost schedule is restored within one cron
 * interval instead of staying lost until someone notices the bin never
 * switched off.
 *
 * Triggered two ways, matching the other cron routes here:
 * - GET, by Vercel Cron (see vercel.json), signed with
 *   `Authorization: Bearer <CRON_SECRET>`.
 * - POST, for manual/external triggering with the `x-api-key` header.
 */

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const republishAll = async () => {
  const schedules = await prisma.powerSchedule.findMany()

  const results = await Promise.all(
    schedules.map(async (schedule) => {
      // Mirrors the topic split in updatePowerSchedule(): userId = null is the
      // legacy global default on the bare topic, a real userId is scoped.
      const topic = schedule.userId
        ? `srb/schedule/${schedule.userId}`
        : "srb/schedule"

      const payload = JSON.stringify({
        enabled: schedule.enabled,
        startMinute: schedule.startMinute,
        endMinute: schedule.endMinute,
        days: schedule.days,
      })

      // One failed publish must not stop the rest - a single unreachable
      // topic shouldn't leave every other bin's schedule unrestored.
      try {
        const ok = await publishMqtt(topic, payload, { retain: true })
        return { topic, published: ok }
      } catch {
        return { topic, published: false }
      }
    })
  )

  return {
    total: results.length,
    published: results.filter((r) => r.published).length,
    failed: results.filter((r) => !r.published).map((r) => r.topic),
  }
}

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization")
    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await republishAll()
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ message }, { status: 500 })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key")
    if (!process.env.API_KEY || authorization !== process.env.API_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await republishAll()
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
