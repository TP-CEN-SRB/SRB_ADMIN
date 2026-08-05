import { Suspense } from "react"
import { getStoreById, getAllStores } from "@/app/action/store"
import UpdateStoreScreen from "./UpdateStoreScreen"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

const UpdateStorePage = ({
  params,
}: {
  params: Promise<{ storeId: string }>
}) => {
  return (
    <Suspense fallback={<FormSkeleton fields={6} />}>
      <UpdateStoreSection params={params} />
    </Suspense>
  )
}

async function UpdateStoreSection({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const [store, stores] = await Promise.all([
    getStoreById(storeId),
    getAllStores(),
  ])

  if (!store) {
    notFound()
  }

  const otherStores = stores.filter((s) => s.id !== store.id)

  return (
    <UpdateStoreScreen
      store={{
        ...store,
        lat: store.lat ?? undefined,
        long: store.long ?? undefined,
      }}
      data={otherStores.map((s) => ({
        ...s,
        lat: s.lat ?? undefined,
        long: s.long ?? undefined,
      }))}
    />
  )
}

export default UpdateStorePage
