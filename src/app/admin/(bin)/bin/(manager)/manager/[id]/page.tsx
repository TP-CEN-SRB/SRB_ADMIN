import { getBinsByUserId } from "./action"
import BinCapacityChart from "./BinCapacityChart"
import { notFound } from "next/navigation"


export default async function BinCapacityPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = await params 
  const bins = await getBinsByUserId(id)
  if (bins.length === 0) {
    notFound()
  }
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-slate-800 mb-8">Bin Capacity</h1>
      <div className="grid place-items-center gap-4 md:grid-cols-5 sm:grid-cols-3 grid-cols-2">
        {bins.map((bin, index) => (
          <BinCapacityChart
            key={index}
            currentCapacity={bin.currentCapacity}
            material={bin.binMaterial.name}
            isUnderMaintenance={bin.status == "UNDER_MAINTENANCE"}
          />
        ))}
      </div>
    </div>
  )
}