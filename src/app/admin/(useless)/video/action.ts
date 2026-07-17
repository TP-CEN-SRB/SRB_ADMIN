"use server"
import { prisma } from "@/lib/db"

export const saveRecording = async (url: string, duration: number) => {
  if (!url || typeof duration !== "number") {
    return { error: "Missing URL or duration" }
  }

  try {
    const video = await prisma.video.create({
      data: {
        name: `Recording ${new Date().toLocaleString()}`,
        fileUrl: url,
        durationInSeconds: duration,
      },
    })

    return { video }
  } catch (err) {
    console.error("Failed to save recording:", err)
    return { error: "Database save failed" }
  }
}
