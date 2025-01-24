"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, Pie, PieChart, Label, Legend } from "recharts";
import BinsDeployedFaculty from "./binsDeployedFaculty";

interface monthlyChartData {
  month: string;
  bin: number;
  [material: string]: number | string;
}

interface ChartProps {
  barChartData?: monthlyChartData[];
  pieChartData: { fac: string; count: number; fill: string; }[];
  barChartConfig: ChartConfig;
}

const Chart = ({
  barChartData,
  pieChartData,
  barChartConfig,
}: ChartProps) => {
  const { month, bin, ...materials } = barChartData![0];
  return (
    <>
      <div className="w-full py-4 px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bar Chart Container */}
        <div className="lg:col-span-8 bg-white rounded-xl p-4 min-h-[400px] w-full">
          <h2 className="text-lg font-bold mb-4">Bins Deployed By Date Filter</h2>
          <div className="w-full h-[400px] lg:h-[500px] min-h-[300px]">
            <ChartContainer 
        config={barChartConfig} 
        className="w-full h-full"
      >
        <BarChart 
          accessibilityLayer 
          data={barChartData} 
          className="font-bold"
          margin={{ 
            top: 20, 
            right: 20, 
            left: 20, 
          }}
        >
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
          <ChartLegend 
            content={
              <ChartLegendContent 
                className="flex flex-wrap justify-center items-center w-full gap-1 font-bold -translate-y-2 [&>*]:basis-1/4 [&>*]:justify-center" 
              />
            } 
            verticalAlign="bottom"
            height={50}
          />
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
        </div>

        {/* Pie Chart Container */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-center">
            Bins Deployed Across All Faculties
          </h2>
          <div className="flex-1 flex flex-col justify-between min-h-[400px]">
            <div className="flex-1">
              <BinsDeployedFaculty data={pieChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Chart;
