import { getStoreById } from "@/app/action/store"
import UpdateStoreForm from "@/components/FormLogic/(Misc)/UpdateStoreForm"
import { notFound } from "next/navigation"


const UpdateStorePage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>
}) => {
  // Fetch store details
  const { storeId } = await params 
  const store = await getStoreById(storeId)

  if (!store) {
    notFound() 
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <UpdateStoreForm id={storeId} store={store} />
    </div>
  )
}

export default UpdateStorePage
