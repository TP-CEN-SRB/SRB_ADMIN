"use client"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { DisposalHourBucket } from "@/app/action/dashboard"

interface DisposalsByHourChartProps {
  data: DisposalHourBucket[]
}

const chartConfig: ChartConfig = {
  count: { label: "Disposals", color: "#0066CC" },
}

const DisposalsByHourChart = ({ data }: DisposalsByHourChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, left: 20 }}>
        <XAxis
          dataKey="hour"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={1}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" className="text-xs" />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export default DisposalsByHourChart
