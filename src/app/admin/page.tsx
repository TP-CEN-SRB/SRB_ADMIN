import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Boxes, Wifi, Wrench, Recycle, Leaf, Users } from "lucide-react"
import { DashboardPeriodToggle } from "./periodToggle"
import { DisposalsByMaterialChart } from "./disposalsByMaterialChart"
import BinsDeployedFaculty from "./components/binsDeployedFaculty"
import { getDashboardStats, DashboardPeriod, getBarChartData, getPieChartData } from "@/app/action/dashboard"
import { BarChartConfig, PieChartConfig } from "./(bin)/bin/(allBinsTable)/chartConfigs"
import { DateRange } from "@/utils/dateUtils"
import { format } from "date-fns"

const periods: DashboardPeriod[] = ["day", "week", "month", "year"]

function formatPeriodLabel(period: DashboardPeriod, offset: number, startDate?: Date, endDate?: Date) {
  if (offset === 0) {
    return period === "day" ? "today" : period === "week" ? "this week" : period === "month" ? "this month" : "this year"
  }
  if (!startDate || !endDate) return ""
  switch (period) {
    case "day":
      return format(startDate, "d MMM yyyy")
    case "week":
      return `${format(startDate, "d/M")} - ${format(endDate, "d/M")}`
    case "month":
      return format(startDate, "MMMM yyyy")
    case "year":
      return format(startDate, "yyyy")
  }
}
// getBarChartData/getPieChartData only branch on "week"/"month" explicitly,
// otherwise grouping defaults to month-across-year — close enough for "day"
// and "year" that a dedicated day-of-day grouping isn't worth adding.
const chartFilter: Record<DashboardPeriod, string> = {
  day: "week",
  week: "week",
  month: "month",
  year: "year",
}

function StatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  value: string | number
  label: string
}) {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-2 ${iconClassName}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; offset?: string }>
}) {
  const params = await searchParams
  const period = (periods.includes(params.period as DashboardPeriod)
    ? params.period
    : "week") as DashboardPeriod
  const offset = Math.min(0, Number(params.offset) || 0)

  const { startDate, endDate } = DateRange(period, offset)
  const filter = chartFilter[period]

  const [stats, barChartData, pieChartData] = await Promise.all([
    getDashboardStats(period, offset),
    getBarChartData(startDate, endDate, filter),
    getPieChartData(startDate, endDate, filter),
  ])

  const { month, bin, ...materials } = barChartData[0] ?? { month: "", bin: 0 }
  const barChartConfig = BarChartConfig({ materials })
  const resolvedLabel = formatPeriodLabel(period, offset, startDate, endDate)

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of bins, disposals, and impact</p>
        </div>
        <DashboardPeriodToggle period={period} offset={offset} rangeLabel={resolvedLabel} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Boxes} iconClassName="bg-blue-500/10 text-blue-600" value={stats.totalBins} label="Total Bins" />
        <StatCard icon={Wifi} iconClassName="bg-green-500/10 text-green-600" value={stats.binsOnline} label="Bins Online (live)" />
        <StatCard icon={Wrench} iconClassName="bg-red-500/10 text-red-600" value={stats.underMaintenanceBins} label="Under Maintenance" />
        <StatCard icon={Recycle} iconClassName="bg-teal-500/10 text-teal-600" value={stats.disposalsMade} label={`Disposals Made (${resolvedLabel})`} />
        <StatCard icon={Leaf} iconClassName="bg-emerald-500/10 text-emerald-600" value={`${stats.totalCarbonOffsetKg.toFixed(1)} kg`} label={`Carbon Offset (${resolvedLabel})`} />
        <StatCard icon={Users} iconClassName="bg-purple-500/10 text-purple-600" value={stats.activeUsers} label={`Active Users (${resolvedLabel})`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Disposals by Material</CardTitle>
          </CardHeader>
          <CardContent>
            <DisposalsByMaterialChart data={barChartData} config={barChartConfig} />
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
