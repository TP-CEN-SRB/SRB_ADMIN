"use client";

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react'
import { Label, Legend, Pie, PieChart } from 'recharts';

interface BinsDeployedFacultyProps {
    data: { fac: string; count: number; fill: string; }[];
}

const BinsDeployedFaculty = ({data}:BinsDeployedFacultyProps) => {
  const chartConfig: ChartConfig = data.reduce((acc, bin) => {
    acc[bin.fac] = {
      label: bin.fac,
      color: bin.fill,
    };
    return acc;
  }, {} as ChartConfig);
  const totalBins = data.reduce((acc, bin) => acc + bin.count, 0);
  // console.log(chartConfig);
  return (
    <>
    <ChartContainer config={chartConfig} className="w-full h-full">
    <PieChart>
    <Pie
      data={data}
      dataKey="count"
      nameKey="fac"
      stroke="0"
      innerRadius="50%"
      cy="45%"
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
                  className="fill-foreground text-2xl lg:text-3xl font-bold"
                >
                  {totalBins?.toLocaleString()}
                </tspan>
                <tspan
                  x={viewBox.cx}
                  y={(viewBox.cy || 0) + 24}
                  className="fill-muted-foreground text-sm font-bold"
                >
                  Disposals
                </tspan>
              </text>
            );
          }
        }}
      />
    </Pie>
    {/* <Legend
      verticalAlign="bottom"
      align="center"
      layout="horizontal"
      formatter={(value) => (
        <span className="text-black text-xs">{value}</span>
      )}
    /> */}
    <ChartLegend
      content={<ChartLegendContent nameKey="fac" payload={[]}/>}
      className="font-bold -translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
    />
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent hideLabel />}
    />
  </PieChart>
</ChartContainer>

    </>
  )
}

export default BinsDeployedFaculty

             {/* <ChartContainer config={pieChartConfig} className="w-full h-full">
                <PieChart accessibilityLayer data={pieChartData} className="font-bold">
                  <Pie
                    data={pieChartData}
                    dataKey="binCount"
                    nameKey="binType"
                    stroke="0"
                    innerRadius="50%"
                    cy="45%"
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
                                className="fill-foreground text-2xl lg:text-3xl font-bold"
                              >
                                {pieChartSum?.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-sm"
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
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    formatter={(value) => (
                      <span className="text-black text-xs">{value}</span>
                    )}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                </PieChart>
              </ChartContainer> */}
