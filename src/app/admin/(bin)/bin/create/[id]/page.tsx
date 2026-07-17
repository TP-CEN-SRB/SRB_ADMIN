import CreateBinForm from "./CreateBinForm"
import { prisma } from "@/lib/db"


export default async function CreateBinFormPageWithBinUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
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
    <>
      <div className="flex justify-center min-h-screen items-center">
        <div className="container mx-auto max-w-lg py-8">
          <CreateBinForm
            materials={getAllMaterials}
            binUserId={id}
            binLocation={getBinLocation?.location}
            usedBinMaterials={getUnavailableMaterialsForBin.map((bin) => bin.binMaterial)}
          />
        </div>
      </div>
    </>
  )
}
