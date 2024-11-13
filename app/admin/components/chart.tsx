"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BinMaterial } from "@prisma/client";
import { Bar, BarChart, XAxis, Pie, PieChart } from "recharts";

class monthlyChartData {
  month: string;
  bin: number;
  binMetal: number;
  binPlastic: number;
  constructor(
    month: string,
    binTotal: number,
    binMetal: number,
    binPlastic: number
  ) {
    this.month = month;
    this.bin = binTotal;
    this.binMetal = binMetal;
    this.binPlastic = binPlastic;
  }
}

class pieChartData {
  binType: BinMaterial;
  binCount: number;
  constructor(binType: BinMaterial, binCount: number) {
    this.binType = binType;
    this.binCount = binCount;
  }
}

interface ChartProps {
  chartData: monthlyChartData[];
  pieChartData: pieChartData[];
}

const chartConfig = {
  binTotal: {
    label: "Total",
    color: "#0066CC",
  },
  binMetal: {
    label: "Metal",
    color: "#4394E5",
  },
  binPlastic: {
    label: "Plastic",
    color: "#41B3A2",
  },
  bin: {
    label: "Bins",
    color: "#0066CC",
  },
  binToolTipLabel: {
    label: "Bins Deployed Monthly",
    color: "#0066CC",
  },
} satisfies ChartConfig;

const PieChartConfig = {
  binType: {
    label: "Material",
  },
  binCount: {
    label: "Count",
  },
  METAL: {
    label: "Metal",
  },
  PLASTIC: {
    label: "Plastic",
  },
} satisfies ChartConfig;

export default function Chart({ chartData, pieChartData }: ChartProps) {
  return (
    <>
      <div className="grid md:grid-cols-8 grid-cols-1 px-4 md:px-6 lg:px-8 py-4 gap-4 font-bold">
        <div className="bg-white rounded-xl col-span-5">
          <ChartContainer config={chartConfig} className="w-full h-[500px]">
            <BarChart accessibilityLayer data={chartData}>
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey="binToolTipLabel"
                    indicator="line"
                  />
                }
              />
              <ChartLegend
                content={<ChartLegendContent />}
                className="text-sm"
              />
              <Bar dataKey="bin" fill="var(--color-bin)" radius={4} />
              <Bar dataKey="binMetal" fill="var(--color-binMetal)" radius={4} />
              <Bar
                dataKey="binPlastic"
                fill="var(--color-binPlastic)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="bg-white rounded-xl col-span-3 flex justify-center">
          <ChartContainer config={PieChartConfig} className="w-full">
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="binCount"
                nameKey="binType"
                stroke="0"
                innerRadius={100}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend
                content={<ChartLegendContent />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center text-sm"
              />
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}
