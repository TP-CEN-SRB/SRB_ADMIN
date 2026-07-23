import { Suspense } from "react"
import { getAllBinManagers } from "../action"
import MapChart from "./BinMapChart"
import { Skeleton } from "@/components/ui/skeleton"

function MapSkeleton() {
  return <Skeleton className="h-full w-full rounded-none" />
}

export default function BinManagerMap(){
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapSection />
    </Suspense>
  )
}

async function MapSection() {
  const binManagers = await getAllBinManagers()
  return (
    <MapChart
      data={binManagers.map((user) => ({
        ...user,
        lat: user.lat?? undefined,
        long: user.long?? undefined,
      }))}
    />
  )
}
