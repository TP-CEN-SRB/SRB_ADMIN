import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FleetUptimeChart from "./components/FleetUptimeChart"
import { getFleetUptimeByHour } from "@/app/action/dashboard"

export async function UptimeChartSection() {
  const data = await getFleetUptimeByHour()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bin Uptime — Last 24 Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No bins registered yet
          </div>
        ) : (
          <div className="h-[260px]">
            <FleetUptimeChart data={data} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
