"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import React, { useMemo } from "react";
import { Bar, BarChart, XAxis, Pie, PieChart, Label, Legend } from "recharts";

interface monthlyChartData {
  month: string;
  bin: number;
  [material: string]: number | string;
}

interface pieChartData {
  binType?: string;
  binCount?: number;
}

interface ChartProps {
  chartData?: monthlyChartData[];
  pieChartData?: pieChartData[];
  barChartConfig: ChartConfig;
  pieChartConfig: ChartConfig;
}

export default function Chart({
  chartData,
  pieChartData,
  barChartConfig,
  pieChartConfig,
}: ChartProps) {
  const { month, bin, ...materials } = chartData![0];
  const totalBins = useMemo(() => {
    return chartData?.reduce((acc, curr) => acc + curr.bin, 0);
  }, [chartData]);
  return (
    <>
      <div className="grid md:grid-cols-8 grid-cols-1 px-4 md:px-6 lg:px-8 py-4 gap-4 font-semibold">
        <div className="bg-white rounded-xl col-span-5">
          <ChartContainer config={barChartConfig} className="w-full h-[500px]">
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
                    labelClassName="font-bold text-sm"
                    labelKey="binToolTipLabel"
                    indicator="line"
                    className="text-xs"
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {/* Dynamically create Bars for each material */}
              {Object.keys(materials).map((material) => (
                <Bar
                  key={material}
                  stackId="a"
                  dataKey={material}
                  fill={`var(--color-${material})`}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </div>
        <div className="bg-white rounded-xl col-span-3 flex justify-center">
          <ChartContainer config={pieChartConfig} className="w-full">
            <PieChart accessibilityLayer data={pieChartData}>
              <Pie
                data={pieChartData}
                dataKey="binCount"
                nameKey="binType"
                stroke="0"
                innerRadius={100}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalBins!.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Bins Deployed
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <Legend
                formatter={(value, entry) => (
                  <span style={{ color: "black" }}>{value}</span> // Change 'red' to any color you want
                )}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    </>
  );
}
