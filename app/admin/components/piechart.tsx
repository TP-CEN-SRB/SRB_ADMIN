"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dataset = [
  {
    date: "25/10/2024",
    Bins: 1000,
  },
  {
    date: "24/10/2024",
    Bins: 2000,
  },
  {
    date: "23/10/2024",
    Bins: 3000,
  },
  {
    date: "22/10/2024",
    Bins: 4000,
  },
  {
    date: "21/10/2024",
    Bins: 5000,
  },
];

const BinChart = () => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataset}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Bins" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BinChart;
