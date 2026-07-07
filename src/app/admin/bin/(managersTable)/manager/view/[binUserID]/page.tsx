import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import ViewBinManagerScreen from "@/components/Screen/ViewBinManagerScreen"

export default async function ViewBinManagerPage({ params }: { params: Promise<{ binUserID: string }> }) {
  const { binUserID } = await params 
  const bins = await prisma.bin.findMany({
    where: { userId: binUserID },
    include: { binMaterial: true, disposals: true },
  })

  if (!bins.length) {
    notFound()
  }

  // Convert Prisma Date → string (for heartbeat + disposals)
  const binsWithFormattedDates = bins.map((bin) => ({
    ...bin,
    lastHeartBeat: bin.lastHeartBeat ? bin.lastHeartBeat.toISOString() : null,
    disposals: bin.disposals.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
  }))

  const manager = await prisma.user.findUnique({
    where: { id: binUserID },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      lat: true,
      long: true,
    },
  })

  if (!manager) {
    notFound()
  }

  return (
    <ViewBinManagerScreen
      binManager={{
        ...manager,
        lat: manager.lat?? undefined,
        long: manager.long?? undefined,
        bins: binsWithFormattedDates,
      }}
    />
  )
}
