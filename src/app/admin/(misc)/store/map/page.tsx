import { Suspense } from "react"
import { getAllStores } from "@/app/action/store"
import StoreMapChart from "./StoreMapChart"
import { Skeleton } from "@/components/ui/skeleton"

function MapSkeleton() {
  return <Skeleton className="h-full w-full rounded-none" />
}

export default function StoreMapPage(){
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapSection />
    </Suspense>
  )
}

async function MapSection() {
  const stores = await getAllStores()
  return (
    <StoreMapChart
      data={stores.map((store) => ({
        ...store,
        lat: store.lat ?? undefined,
        long: store.long ?? undefined,
      }))}
    />
  )
}
