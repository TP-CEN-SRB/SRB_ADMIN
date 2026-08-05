import { Suspense } from "react"
import { getAllStores } from "@/app/action/store"
import CreateStoreScreen from "./CreateStoreScreen"
import { FormSkeleton } from "@/components/FormSkeleton"

export default function CreateStorePage() {
  return (
    <Suspense fallback={<FormSkeleton fields={6} />}>
      <CreateStoreSection />
    </Suspense>
  )
}

async function CreateStoreSection() {
  const stores = await getAllStores()
  return (
    <CreateStoreScreen
      data={stores.map((store) => ({
        ...store,
        lat: store.lat ?? undefined,
        long: store.long ?? undefined,
      }))}
    />
  )
}
