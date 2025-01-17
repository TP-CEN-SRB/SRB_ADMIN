"use client";

import React, { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  XAxis,
  Line,
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    useState<keyof typeof binTimeLineChartConfig>("totalDisposals");
  const [totalDisposalsSelected, setTotalDisposalsSelected] = useState(true);
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 ">
      <div className="bg-white rounded-xl">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="ml-4 bg-white data-[active=true]:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <span className="px-4 font-bold text-gray-600">Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Materials</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(binTimeLineChartConfig).map((key) => {
                const chart = key as keyof typeof binTimeLineChartConfig;
                return (
                  binTimeLineChartConfig[chart].label !==
                    "Disposals Hourly" && (
                    <DropdownMenuCheckboxItem
                      key={chart}
                      checked={activeChart === chart}
                      onClick={() => {
                        if (chart === "totalDisposals") {
                          setTotalDisposalsSelected(true);
                        } else setTotalDisposalsSelected(false);
                        setActiveChart(chart);
                      }}
                    >
                      {binTimeLineChartConfig[chart].label}
                    </DropdownMenuCheckboxItem>
                  )
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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

            {Object.keys(binTimeLineChartConfig).map((key) => {
              const chart = key as keyof typeof binTimeLineChartConfig;
              return totalDisposalsSelected ? (
                <Line
                  key={chart} // Add a unique key for each mapped element
                  dataKey={chart}
                  type="monotone"
                  stroke={`var(--color-${chart})`}
                  strokeWidth={3}
                  dot={false}
                  className={chart}
                />
              ) : (
                <Line
                  dataKey={chart === activeChart ? chart : ""}
                  type="monotone"
                  stroke={`var(--color-${chart})`}
                  strokeWidth={3}
                  dot={false}
                  className={chart}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BinTimeChart;
