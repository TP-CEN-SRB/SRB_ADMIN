"use client"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"
import type { FleetUptimeHour } from "@/app/action/dashboard"

interface FleetUptimeChartProps {
  data: FleetUptimeHour[]
}

// Green/yellow/red mirrors the per-bin timeline legend on the bin manager
// view page; gray means no bin reported a heartbeat in that hour at all
// (distinct from 0%, which means bins reported and were offline).
const colorForUptime = (pct: number | null) => {
  if (pct === null) return "#D1D5DB"
  if (pct >= 80) return "#22C55E"
  if (pct >= 50) return "#EAB308"
  return "#EF4444"
}

const chartConfig: ChartConfig = {
  display: { label: "Uptime" },
}

const FleetUptimeChart = ({ data }: FleetUptimeChartProps) => {
  const plotData = data.map((d) => ({
    ...d,
    display: d.uptimePct ?? 0,
    fill: colorForUptime(d.uptimePct),
  }))

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart accessibilityLayer data={plotData} margin={{ top: 20, right: 20, left: 20 }}>
        <XAxis
          dataKey="hour"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={1}
        />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="text-xs"
              formatter={(_value, _name, item) => {
                const pct = (item.payload as FleetUptimeHour).uptimePct
                return (
                  <span className="text-muted-foreground">
                    {pct === null ? "No data reported" : `${pct}% of bins online`}
                  </span>
                )
              }}
            />
          }
        />
        <Bar dataKey="display" radius={4}>
          {plotData.map((entry) => (
            <Cell key={entry.hour} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export default FleetUptimeChart
