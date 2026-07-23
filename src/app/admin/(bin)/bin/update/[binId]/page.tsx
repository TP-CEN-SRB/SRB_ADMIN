import { Suspense } from "react"
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
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <Suspense fallback={<FormSkeleton fields={3} />}>
        <UpdateBinFormSection params={params} />
      </Suspense>
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
