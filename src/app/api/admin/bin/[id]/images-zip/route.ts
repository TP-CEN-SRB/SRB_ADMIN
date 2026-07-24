import { Readable } from "node:stream"
import { PassThrough } from "node:stream"
import { ZipArchive } from "archiver"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: binId } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "admin") {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const asOfParam = searchParams.get("asOf")
  const asOf = asOfParam ? new Date(asOfParam) : new Date()

  const disposals = await prisma.disposal.findMany({
    where: { binId, imageUrl: { not: null }, createdAt: { lte: asOf } },
    select: { id: true, imageUrl: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  if (disposals.length === 0) {
    return new Response("No images found for this bin.", { status: 404 })
  }

  const archive = new ZipArchive({ zlib: { level: 9 } })
  const passthrough = new PassThrough()
  archive.on("error", (err) => passthrough.destroy(err))
  archive.pipe(passthrough)

  ;(async () => {
    const BATCH_SIZE = 5
    const failures: string[] = []
    for (let i = 0; i < disposals.length; i += BATCH_SIZE) {
      const batch = disposals.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (d) => {
          try {
            const res = await fetch(d.imageUrl!)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const buffer = Buffer.from(await res.arrayBuffer())
            const contentType = res.headers.get("content-type") ?? ""
            const ext = contentType.includes("png")
              ? "png"
              : contentType.includes("webp")
              ? "webp"
              : "jpg"
            const stamp = d.createdAt.toISOString().replace(/[:.]/g, "-")
            archive.append(buffer, { name: `${stamp}_${d.id}.${ext}` })
          } catch (e) {
            failures.push(`${d.id}: ${(e as Error).message}`)
          }
        })
      )
    }
    if (failures.length > 0) {
      archive.append(failures.join("\n"), { name: "_failed-downloads.txt" })
    }
    archive.finalize()
  })()

  const webStream = Readable.toWeb(passthrough) as ReadableStream

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bin-${binId}-images-${asOf
        .toISOString()
        .slice(0, 10)}.zip"`,
    },
  })
}
