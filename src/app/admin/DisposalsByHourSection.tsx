import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DisposalsByHourChart from "./components/DisposalsByHourChart"
import { getDisposalsByHour } from "@/app/action/dashboard"

interface DisposalsByHourSectionProps {
  dateFrom?: Date
  dateTo?: Date
}

export async function DisposalsByHourSection({ dateFrom, dateTo }: DisposalsByHourSectionProps) {
  const data = await getDisposalsByHour(dateFrom, dateTo)
  const hasActivity = data.some((d) => d.count > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Usage by Time of Day</CardTitle>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
          <div className="h-[260px]">
            <DisposalsByHourChart data={data} />
          </div>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No disposals in this period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
