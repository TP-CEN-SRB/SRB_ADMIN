"use client";
import React, { useState } from "react";
import HeartbeatBinCard from "../Card/BinHeartbeatCard";
import { Faculty, BinStatus } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Types aligned with Prisma
interface Disposal {
  id: string;
  createdAt: string; // ISO string
  weightInGrams: number;
  carbonprint: number;
}

interface Bin {
  id: string;
  status: BinStatus;
  currentCapacity: number;
  lastHeartBeat: string | null;
  binMaterial: {
    id: string;
    name: string;
  };
  disposals: Disposal[];
}

interface BinManager {
  id: string;
  name: string;
  email: string;
  faculty: Faculty;
  lat: number | undefined;
  long: number | undefined;
  bins: Bin[];
}

interface ScreenProps {
  binManager: BinManager;
}

const ViewBinManagerScreen = ({ binManager }: ScreenProps) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Flatten disposals
  const disposals = binManager.bins.flatMap((b) => b.disposals);

  // Helper → derive online/offline from heartbeat
  const getHeartbeatStatus = (lastHeartBeat: string | null): "online" | "offline" => {
    if (!lastHeartBeat) return "offline";
    const diff = Date.now() - new Date(lastHeartBeat).getTime();
    return diff < 60_000 ? "online" : "offline"; // online if < 1min old
  };

  // ---- Group by Year ----
  const yearData = Object.values(
    disposals.reduce((acc: Record<string, { year: string; count: number }>, d) => {
      const year = new Date(d.createdAt).getFullYear().toString();
      if (!acc[year]) acc[year] = { year, count: 0 };
      acc[year].count++;
      return acc;
    }, {})
  );

  // ---- Group by Month ----
  const monthData =
    selectedYear != null
      ? Object.values(
          disposals.reduce(
            (
              acc: Record<string, { month: string; count: number }>,
              d
            ) => {
              const date = new Date(d.createdAt);
              if (date.getFullYear() !== selectedYear) return acc;
              const month = (date.getMonth() + 1).toString(); // 1-12
              if (!acc[month]) acc[month] = { month, count: 0 };
              acc[month].count++;
              return acc;
            },
            {}
          )
        )
      : [];

  // ---- Group by Day ----
  const dayData =
    selectedMonth != null
      ? Object.values(
          disposals.reduce(
            (acc: Record<string, { day: string; count: number }>, d) => {
              const date = new Date(d.createdAt);
              if (
                date.getFullYear() !== selectedYear ||
                date.getMonth() + 1 !== selectedMonth
              )
                return acc;
              const day = date.getDate().toString();
              if (!acc[day]) acc[day] = { day, count: 0 };
              acc[day].count++;
              return acc;
            },
            {}
          )
        )
      : [];

  // ---- Group by Hour ----
  const hourData =
    selectedDay != null
      ? Object.values(
          disposals.reduce(
            (acc: Record<string, { hour: string; count: number }>, d) => {
              const date = new Date(d.createdAt);
              if (
                date.getFullYear() !== selectedYear ||
                date.getMonth() + 1 !== selectedMonth ||
                date.getDate() !== selectedDay
              )
                return acc;
              const hour = date.getHours().toString(); // 0-23
              if (!acc[hour]) acc[hour] = { hour, count: 0 };
              acc[hour].count++;
              return acc;
            },
            {}
          )
        )
      : [];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* 1. Bin heartbeat/status cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {binManager.bins.map((bin) => (
          <HeartbeatBinCard
            key={bin.id}
            title={bin.binMaterial.name}
            percentage={bin.currentCapacity}
            status={getHeartbeatStatus(bin.lastHeartBeat)}
            lastActive={bin.lastHeartBeat}
            color={
              getHeartbeatStatus(bin.lastHeartBeat) === "online"
                ? "ring-green-400"
                : "ring-red-400"
            }
          />
        ))}
      </section>

      {/* 2. Year dropdown */}
        <section className="border rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Disposals by Year</h2>
        <select
            value={selectedYear}
            onChange={(e) => {
            setSelectedMonth(null);
            setSelectedDay(null);
            setSelectedYear(Number(e.target.value));
            }}
            className="border px-3 py-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {yearData.map((y) => (
            <option key={y.year} value={y.year}>
                {y.year}
            </option>
            ))}
        </select>
        </section>

        {/* 3. Month drilldown */}
        {selectedYear && (
        <section className="border rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">
            Disposals in {selectedYear} (by Month)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={monthData}
                onClick={(e) => {
                if (e && e.activeLabel) {
                    setSelectedMonth(Number(e.activeLabel));
                    setSelectedDay(null);
                }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
            </ResponsiveContainer>
        </section>
        )}

        {/* 4. Day drilldown */}
        {selectedMonth && (
        <section className="border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold mb-4">
                Disposals in {selectedYear}-{selectedMonth} (by Day)
            </h2>
            <button
                onClick={() => setSelectedMonth(null)}
                className="text-blue-600 underline text-sm"
            >
                Back to Year
            </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={dayData}
                onClick={(e) => {
                if (e && e.activeLabel) {
                    setSelectedDay(Number(e.activeLabel));
                }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ffc658" />
            </LineChart>
            </ResponsiveContainer>
        </section>
        )}

        {/* 5. Hour drilldown */}
        {selectedDay && (
        <section className="border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold mb-4">
                Disposals on {selectedYear}-{selectedMonth}-{selectedDay} (by Hour)
            </h2>
            <button
                onClick={() => setSelectedDay(null)}
                className="text-blue-600 underline text-sm"
            >
                Back to Month
            </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ff7300" />
            </LineChart>
            </ResponsiveContainer>
        </section>
        )}
    </div>
  );
};

export default ViewBinManagerScreen;
