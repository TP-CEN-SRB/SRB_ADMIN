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

class BinDisposalsByTime {
  hour: string;
  totalDisposals: number;
  metalDisposals: number;
  plasticDisposals: number;
  constructor(hour: string, metalDisposals: number, plasticDisposals: number) {
    this.hour = hour;
    this.metalDisposals = metalDisposals;
    this.plasticDisposals = plasticDisposals;
    this.totalDisposals = metalDisposals + plasticDisposals;
  }
}

interface ChartProps {
  chartData: BinDisposalsByTime[];
}

const chartConfig = {
  totalDisposals: {
    label: "Total Disposals",
    color: "#0066CC",
  },
  metalDisposals: {
    label: "Metal",
    color: "#4394E5",
  },
  plasticDisposals: {
    label: "Plastic",
    color: "#41B3A2",
  },
  binToolTipLabel: {
    label: "Bins Disposals Hourly",
    color: "#0066CC",
  },
} satisfies ChartConfig;

const BinTimeChart = ({ chartData }: ChartProps) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("totalDisposals");
  const [totalDisposalsSelected, setTotalDisposalsSelected] = useState(true);
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 ">
      <div className="bg-white rounded-xl">
        <div className="flex mb-4 justify-end pr-4">
          {["totalDisposals", "metalDisposals", "plasticDisposals"].map(
            (key) => {
              const chart = key as keyof typeof chartConfig;
              return (
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
                    {chartConfig[chart].label}
                  </span>
                </Button>
              );
            }
          )}
        </div>
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
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
              dataKey={
                totalDisposalsSelected ? "plasticDisposals" : activeChart
              }
              type="monotone"
              stroke={`var(--color-${
                totalDisposalsSelected ? "plasticDisposals" : activeChart
              })`}
              strokeWidth={3}
              dot={false}
            />
            <Line
              dataKey={totalDisposalsSelected ? "metalDisposals" : ""}
              type="monotone"
              stroke={`var(--color-${
                totalDisposalsSelected ? "metalDisposals" : ""
              })`}
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
