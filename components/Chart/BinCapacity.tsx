"use client";
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface ChartProps {
  currentCapacity: number;
  totalCapacity: number;
  material: string;
}

const BinCapacityChart = ({
  currentCapacity,
  totalCapacity,
  material,
}: ChartProps) => {
  const chartData = [
    { name: "empty", count: totalCapacity - currentCapacity, fill: "#4B5563" },
    { name: "filled", count: currentCapacity, fill: "#3B82F6" },
  ];

  const chartConfig = {
    count: {
      label: "Waste",
    },
    empty: {
      label: "Empty",
    },
    filled: {
      label: "Filled",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square md:min-h-[400px] min-h-150px"
    >
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
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
                      {currentCapacity}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="font-semibold"
                    >
                      {material}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <ChartLegend
          className="md:text-lg text-base"
          content={<ChartLegendContent />}
        />
      </PieChart>
    </ChartContainer>
  );
};

export default BinCapacityChart;
