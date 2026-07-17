"use client"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis } from "recharts"

interface MonthlyChartData {
  month: string
  bin: number
  [material: string]: number | string
}

// chartConfigs.tsx's BarChartConfig() returns a locally-typed ChartConfig
// that's a looser superset of shadcn's — every entry it actually produces
// is a valid { label, color } object, so the cast below is safe.
type LooseChartConfig = { [key: string]: { label: string; color?: string } | string | number }

export function DisposalsByMaterialChart({
  data,
  config,
}: {
  data: MonthlyChartData[]
  config: LooseChartConfig
}) {
  const { month, bin, ...materials } = data[0] ?? { month: "", bin: 0 }

  return (
    <ChartContainer config={config as ChartConfig} className="w-full h-[300px]">
      <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, left: 20 }}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" className="text-xs" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {Object.keys(materials).map((material) => {
          const entry = config[material]
          const color = typeof entry === "object" ? entry.color : undefined
          return <Bar key={material} stackId="a" dataKey={material} fill={color ?? "#0066CC"} />
        })}
      </BarChart>
    </ChartContainer>
  )
}
