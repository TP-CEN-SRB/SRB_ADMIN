import { getBinById } from "@/app/action/bin"
import NotFoundPage from "@/app/not-found"
import { UpdateBinForm } from "@/components/FormLogic/(Bins)/UpdateBinForm"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"


const UpdateBinManagerPage = async ({
  params,
}: {
  params: Promise<{ binId: string }>
}) => {

  // Fetch the bin data first
  const { binId } = await params 
  const bin = await getBinById(binId)
  if (!bin) {
    notFound()
  }
  const getAllMaterials = await prisma.binMaterial.findMany()
  return (
    <>
      <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
        <UpdateBinForm
          id={binId}
          initialData={bin}
          materials={getAllMaterials}
          location={bin.user.location as string}
          binMaterialName={bin.binMaterial.name as string}
        />
      </div>
    </>
  )
}

export default UpdateBinManagerPage
