"use client";

import React, { useState } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  Line,
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { object } from "zod";

interface BinDisposalsByTime {
  hour: string;
  [key: string]: string | number; // Index signature to allow dynamic material properties
}

interface ChartProps {
  chartData: BinDisposalsByTime[];
  binTimeLineChartConfig: ChartConfig;
}

const BinTimeChart = ({ chartData, binTimeLineChartConfig }: ChartProps) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof binTimeLineChartConfig>("totalDisposals");
  const [totalDisposalsSelected, setTotalDisposalsSelected] = useState(true);
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 ">
      <div className="bg-white rounded-xl">
        <div className="flex mb-4 justify-end pr-4">
          {Object.keys(binTimeLineChartConfig).map((key) => {
            const chart = key as keyof typeof binTimeLineChartConfig;
            return (
              binTimeLineChartConfig[chart].label !== "Disposals Hourly" && (
                <Button
                  variant="secondary"
                  key={chart}
                  data-active={activeChart === chart}
                  onClick={() => {
                    if (chart === "totalDisposals") {
                      setTotalDisposalsSelected(true);
                    } else setTotalDisposalsSelected(false);
                    setActiveChart(chart);
                  }}
                  className="ml-4 bg-white data-[active=true]:bg-muted"
                >
                  <span className="px-4 font-bold text-gray-600">
                    {binTimeLineChartConfig[chart].label}
                  </span>
                </Button>
              )
            );
          })}
        </div>
        <ChartContainer
          config={binTimeLineChartConfig}
          className="h-[500px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 20, right: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="binToolTipLabel"
                  indicator="line"
                />
              }
            />
            <Line
              dataKey={totalDisposalsSelected ? "PLASTIC" : activeChart}
              type="monotone"
              stroke={`var(--color-${
                totalDisposalsSelected ? "PLASTIC" : activeChart
              })`}
              strokeWidth={3}
              dot={false}
            />
            <Line
              dataKey={totalDisposalsSelected ? "METAL" : ""}
              type="monotone"
              stroke={`var(--color-${totalDisposalsSelected ? "METAL" : ""})`}
              strokeWidth={3}
              dot={false}
              className={totalDisposalsSelected ? "" : "hidden"}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BinTimeChart;
