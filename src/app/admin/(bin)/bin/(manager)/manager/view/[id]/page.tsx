import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import ViewBinManagerScreen from "./ViewBinManagerScreen"

function ViewBinManagerSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}

export default function ViewBinManagerPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ViewBinManagerSkeleton />}>
      <ViewBinManagerSection params={params} />
    </Suspense>
  )
}

async function ViewBinManagerSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const bins = await prisma.bin.findMany({
    where: { userId: id },
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
    where: { id: id },
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
