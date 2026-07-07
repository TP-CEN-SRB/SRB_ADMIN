import { getUsedMaterialsForBin } from "@/app/action/bin"
import CreateBinForm from "@/components/FormLogic/(Bins)/CreateBinForm"
import { prisma } from "@/lib/db"


export default async function CreateBinFormPageWithBinUser({ params }: { params: Promise<{ binUserId: string }> }) {
  const { binUserId } = await params 
  const [getAllMaterials, getBinLocation, getUnavailableMaterialsForBin] =
    await Promise.all([
      prisma.binMaterial.findMany(),
      prisma.user.findUnique({
        where: { id: binUserId },
        select: { location: true },
      }),
      prisma.bin.findMany({
        select: {
          binMaterial: true,
        },
        where: {
          userId: binUserId,
        },
      }),
    ])
  return (
    <>
      <div className="flex justify-center min-h-screen items-center">
        <div className="container mx-auto max-w-lg py-8">
          <CreateBinForm
            materials={getAllMaterials}
            binUserId={binUserId}
            binLocation={getBinLocation?.location}
            usedBinMaterials={getUnavailableMaterialsForBin.map((bin) => bin.binMaterial)}
          />
        </div>
      </div>
    </>
  )
}
