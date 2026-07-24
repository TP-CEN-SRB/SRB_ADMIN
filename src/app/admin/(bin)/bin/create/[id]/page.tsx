import { Suspense } from "react"
import CreateBinForm from "./CreateBinForm"
import { prisma } from "@/lib/db"
import { FormSkeleton } from "@/components/FormSkeleton"

export default async function CreateBinFormPageWithBinUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="container mx-auto max-w-lg px-4 py-6 md:px-6">
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <CreateBinFormSection id={id} />
      </Suspense>
    </div>
  )
}

async function CreateBinFormSection({ id }: { id: string }) {
  const [getAllMaterials, getBinLocation, getUnavailableMaterialsForBin] =
    await Promise.all([
      prisma.binMaterial.findMany(),
      prisma.user.findUnique({
        where: { id: id },
        select: { location: true },
      }),
      prisma.bin.findMany({
        select: {
          binMaterial: true,
        },
        where: {
          userId: id,
        },
      }),
    ])
  return (
    <CreateBinForm
      materials={getAllMaterials}
      binUserId={id}
      binLocation={getBinLocation?.location}
      usedBinMaterials={getUnavailableMaterialsForBin.map((bin) => bin.binMaterial)}
    />
  )
}
