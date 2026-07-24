import { Card, CardContent } from "@/components/ui/card"
import { Boxes, Wifi, Wrench, Recycle, Leaf, Users } from "lucide-react"
import { getDashboardStats, DashboardPeriod } from "@/app/action/dashboard"

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

interface StatsSectionProps {
  period: DashboardPeriod
  offset: number
  resolvedLabel: string
}

export async function StatsSection({ period, offset, resolvedLabel }: StatsSectionProps) {
  const stats = await getDashboardStats(period, offset)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard icon={Boxes} iconClassName="bg-blue-500/10 text-blue-600" value={stats.totalBins} label="Total Bins" />
      <StatCard icon={Wifi} iconClassName="bg-green-500/10 text-green-600" value={stats.binsOnline} label="Bins Online (live)" />
      <StatCard icon={Wrench} iconClassName="bg-red-500/10 text-red-600" value={stats.underMaintenanceBins} label="Under Maintenance" />
      <StatCard icon={Recycle} iconClassName="bg-teal-500/10 text-teal-600" value={stats.disposalsMade} label={`Disposals Made (${resolvedLabel})`} />
      <StatCard icon={Leaf} iconClassName="bg-emerald-500/10 text-emerald-600" value={`${stats.totalCarbonOffsetKg.toFixed(1)} kg`} label={`Carbon Offset (${resolvedLabel})`} />
      <StatCard icon={Users} iconClassName="bg-purple-500/10 text-purple-600" value={stats.activeUsers} label={`Active Users (${resolvedLabel})`} />
    </div>
  )
}
