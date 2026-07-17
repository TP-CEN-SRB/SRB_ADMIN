import { Card, CardContent } from "@/components/ui/card"
import { Boxes, Wifi, Wrench, Recycle, Leaf, Users } from "lucide-react"
import { DashboardPeriodToggle } from "./periodToggle"
import { getDashboardStats, DashboardPeriod } from "@/app/action/dashboard"

const periods: DashboardPeriod[] = ["day", "week", "month", "year"]
const periodLabel: Record<DashboardPeriod, string> = {
  day: "today",
  week: "this week",
  month: "this month",
  year: "this year",
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
  searchParams: Promise<{ period?: string }>
}) {
  const params = await searchParams
  const period = (periods.includes(params.period as DashboardPeriod)
    ? params.period
    : "week") as DashboardPeriod

  const stats = await getDashboardStats(period)

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of bins, disposals, and impact</p>
        </div>
        <DashboardPeriodToggle period={period} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Boxes} iconClassName="bg-blue-500/10 text-blue-600" value={stats.totalBins} label="Total Bins" />
        <StatCard icon={Wifi} iconClassName="bg-green-500/10 text-green-600" value={stats.binsOnline} label="Bins Online (live)" />
        <StatCard icon={Wrench} iconClassName="bg-red-500/10 text-red-600" value={stats.underMaintenanceBins} label="Under Maintenance" />
        <StatCard icon={Recycle} iconClassName="bg-teal-500/10 text-teal-600" value={stats.disposalsMade} label={`Disposals Made (${periodLabel[period]})`} />
        <StatCard icon={Leaf} iconClassName="bg-emerald-500/10 text-emerald-600" value={`${stats.totalCarbonOffsetKg.toFixed(1)} kg`} label={`Carbon Offset (${periodLabel[period]})`} />
        <StatCard icon={Users} iconClassName="bg-purple-500/10 text-purple-600" value={stats.activeUsers} label={`Active Users (${periodLabel[period]})`} />
      </div>
    </div>
  )
}
