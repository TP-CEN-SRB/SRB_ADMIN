import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBinsByUserId, getBinManagerHeader } from "./action"
import BinCapacityChart from "./BinCapacityChart"
import { notFound } from "next/navigation"

export default async function BinCapacityPage({ params }: { params: Promise<{ id: string }> }){
  const { id } = await params
  const [bins, manager] = await Promise.all([
    getBinsByUserId(id),
    getBinManagerHeader(id),
  ])
  if (bins.length === 0) {
    notFound()
  }
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
        <Link href="/admin/bin/manager">
          <ArrowLeft className="mr-2 size-4" /> Back
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{manager?.name ?? "Bin Manager"}</h1>
        <p className="text-sm text-muted-foreground">
          {manager?.location ?? "Location not available"} — Bin Capacity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bins</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}