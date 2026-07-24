import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DisposalsByMaterialChart } from "./disposalsByMaterialChart"
import { getBarChartData } from "@/app/action/dashboard"
import { BarChartConfig } from "./(bin)/bin/(allBinsTable)/chartConfigs"

interface BarChartSectionProps {
  dateFrom?: Date
  dateTo?: Date
  filter: string
}

export async function BarChartSection({ dateFrom, dateTo, filter }: BarChartSectionProps) {
  const barChartData = await getBarChartData(dateFrom, dateTo, filter)
  const { month, bin, ...materials } = barChartData[0] ?? { month: "", bin: 0 }
  const barChartConfig = BarChartConfig({ materials })

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Disposals by Material</CardTitle>
      </CardHeader>
      <CardContent>
        <DisposalsByMaterialChart data={barChartData} config={barChartConfig} />
      </CardContent>
    </Card>
  )
}
