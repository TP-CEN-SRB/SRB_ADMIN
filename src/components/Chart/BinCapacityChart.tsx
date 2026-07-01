"use client";
import { Bar, BarChart, LabelList, XAxis } from "recharts";
import { FaScrewdriverWrench } from "react-icons/fa6";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  currentCapacity: number;
  material: string;
  isUnderMaintenance: boolean;
}

export default function BinCapacityChart({
  currentCapacity,
  material,
  isUnderMaintenance,
}: ChartProps) {
  const chartData = [
    {
      name: material,
      currentCapacity: currentCapacity,
      totalCapacity: 100 - currentCapacity,
      maintenanceCapacity: 0,
      totalMaintenanceCapacity: 100,
    },
  ];
  const chartConfig = {
    currentCapacity: {
      label: "Filled",
      color: `${
        currentCapacity > 85
          ? "#DC2626"
          : currentCapacity > 60
          ? "#eab308"
          : "#22c55e"
      }`,
    },
    totalCapacity: {
      label: "Empty",
      color: "#4B5563",
    },
    totalMaintenanceCapacity: {
      label: "Under Maintenance",
      color: "#4B5563",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={chartConfig} className="min-h-[200px] max-w-24">
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            className="font-bold !text-slate-800"
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          {isUnderMaintenance ? (
            <>
              <Bar
                dataKey="totalMaintenanceCapacity"
                fill="var(--color-totalMaintenanceCapacity)"
                radius={[4, 4, 4, 4]}
                stackId="a"
              >
                <LabelList
                  dataKey="totalMaintenanceCapacity"
                  position="center"
                  content={({ x, y }) => (
                    <g transform={`translate(28,60)`}>
                      <FaScrewdriverWrench className="text-red-500" size={40} />
                    </g>
                  )}
                />
              </Bar>
            </>
          ) : (
            <>
              {Math.floor(currentCapacity) !== 0 && (
                <Bar
                  dataKey="currentCapacity"
                  fill="var(--color-currentCapacity)"
                  radius={
                    Math.ceil(currentCapacity) === 100 ||
                    Math.floor(currentCapacity) === 0
                      ? [4, 4, 4, 4]
                      : [0, 0, 4, 4]
                  }
                  stackId="a"
                >
                  <LabelList
                    dataKey="currentCapacity"
                    position="center"
                    content={({ value }) => (
                      <text
                        x="50%"
                        y="50%"
                        dy={-10}
                        fill="white"
                        fontSize={14}
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {value === 100
                          ? "Full"
                          : `${currentCapacity.toFixed(2)}%`}
                      </text>
                    )}
                  />
                </Bar>
              )}
              {Math.ceil(currentCapacity) !== 100 && (
                <Bar
                  dataKey="totalCapacity"
                  fill="var(--color-totalCapacity)"
                  radius={
                    Math.ceil(currentCapacity) === 100 ||
                    Math.floor(currentCapacity) === 0
                      ? [4, 4, 4, 4]
                      : [4, 4, 0, 0]
                  }
                  stackId="a"
                >
                  <LabelList
                    dataKey="currentCapacity"
                    position="center"
                    content={({ value }) => (
                      <text
                        x="50%"
                        y="50%"
                        dy={-10}
                        fill="white"
                        fontSize={14}
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {value === 100
                          ? "Full"
                          : `${currentCapacity.toFixed(2)}%`}
                      </text>
                    )}
                  />
                </Bar>
              )}
            </>
          )}

          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={false}
            defaultIndex={1}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
