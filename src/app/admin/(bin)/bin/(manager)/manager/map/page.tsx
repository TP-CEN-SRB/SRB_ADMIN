import { Suspense } from "react"
import { getAllBinManagers } from "../action"
import MapChart from "./BinMapChart"
import { Skeleton } from "@/components/ui/skeleton"

// No headers()/cookies() call here for Next to key off, so without this it
// gets statically prerendered at build time — a frozen snapshot that never
// reflects managers deleted (or added/moved) afterward.
export const dynamic = "force-dynamic"

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
