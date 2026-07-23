import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BinsDeployedFaculty from "./components/binsDeployedFaculty"
import { getPieChartData } from "@/app/action/dashboard"

interface PieChartSectionProps {
  dateFrom?: Date
  dateTo?: Date
  filter: string
}

export async function PieChartSection({ dateFrom, dateTo, filter }: PieChartSectionProps) {
  const pieChartData = await getPieChartData(dateFrom, dateTo, filter)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bins by Faculty</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <BinsDeployedFaculty data={pieChartData} />
        </div>
      </CardContent>
    </Card>
  )
}
