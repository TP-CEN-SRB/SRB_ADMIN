import { Suspense } from "react"
import { DashboardPeriodToggle } from "./periodToggle"
import { DashboardPeriod } from "@/app/action/dashboard"
import { DateRange } from "@/utils/dateUtils"
import { format } from "date-fns"
import { StatsSection } from "./StatsSection"
import { BarChartSection } from "./BarChartSection"
import { PieChartSection } from "./PieChartSection"
import { UptimeChartSection } from "./UptimeChartSection"
import { DisposalsByHourSection } from "./DisposalsByHourSection"
import { StatsSkeleton, ChartSkeleton } from "./skeletons"

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

      <Suspense key={`stats:${period}:${offset}`} fallback={<StatsSkeleton />}>
        <StatsSection period={period} offset={offset} resolvedLabel={resolvedLabel} />
      </Suspense>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Suspense
          key={`bar:${period}:${offset}`}
          fallback={<ChartSkeleton title="Disposals by Material" className="lg:col-span-2" />}
        >
          <BarChartSection dateFrom={startDate} dateTo={endDate} filter={filter} />
        </Suspense>

        <Suspense key={`pie:${period}:${offset}`} fallback={<ChartSkeleton title="Bins by Faculty" />}>
          <PieChartSection dateFrom={startDate} dateTo={endDate} filter={filter} />
        </Suspense>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton title="Bin Uptime — Last 24 Hours" />}>
          <UptimeChartSection />
        </Suspense>

        <Suspense
          key={`usage-hour:${period}:${offset}`}
          fallback={<ChartSkeleton title="Usage by Time of Day" />}
        >
          <DisposalsByHourSection dateFrom={startDate} dateTo={endDate} />
        </Suspense>
      </div>
    </div>
  )
}
