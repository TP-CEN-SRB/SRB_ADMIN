import Link from "next/link"
import { Suspense } from "react"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBinById } from "./action"
import UpdateBinForm from "./UpdateBinForm"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

const UpdateBinManagerPage = ({
  params,
}: {
  params: Promise<{ binId: string }>
}) => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Bin</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/bin">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<FormSkeleton fields={3} />}>
          <UpdateBinFormSection params={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function UpdateBinFormSection({ params }: { params: Promise<{ binId: string }> }) {
  const { binId } = await params
  const bin = await getBinById(binId)
  if (!bin) {
    notFound()
  }
  const getAllMaterials = await prisma.binMaterial.findMany()
  return (
    <UpdateBinForm
      id={binId}
      initialData={bin}
      materials={getAllMaterials}
      location={bin.user.location as string}
      binMaterialName={bin.binMaterial.name as string}
    />
  )
}

export default UpdateBinManagerPage
