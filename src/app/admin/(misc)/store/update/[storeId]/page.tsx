import Link from "next/link"
import { Suspense } from "react"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getStoreById } from "@/app/action/store"
import UpdateStoreForm from "@/components/FormLogic/(Misc)/UpdateStoreForm"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

const UpdateStorePage = ({
  params,
}: {
  params: Promise<{ storeId: string }>
}) => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Store</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/store">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<FormSkeleton fields={4} />}>
          <UpdateStoreSection params={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function UpdateStoreSection({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const store = await getStoreById(storeId)

  if (!store) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Details</CardTitle>
        <CardDescription>Update the store&apos;s account information.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateStoreForm id={storeId} store={store} />
      </CardContent>
    </Card>
  )
}

export default UpdateStorePage
