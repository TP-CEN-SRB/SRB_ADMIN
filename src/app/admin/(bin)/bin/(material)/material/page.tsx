
import { getAllMaterials } from "@/app/action/binMaterial"
import { listOfBinMaterialInUse } from "@/app/action/bin"
import MaterialDataTable from "./materialDataTable"

async function getData(){
  const allBinMaterials = await getAllMaterials()
  return allBinMaterials.map((binMat) => ({
    id: binMat.id as string,
    name: binMat.name as string,
    multiplier: binMat.multiplier as number,
    carbon_multiplier: binMat.carbon_multiplier as number,
  }))
}

export default async function AllBinMaterialsPage(){
  const data = await getData()
  const binMaterialInUse = await listOfBinMaterialInUse()
  return(
    <div className="h-full w-full overflow-y-auto pb-8">
      <MaterialDataTable data={data} allBinMaterials={binMaterialInUse} />
    </div>
  )
}


