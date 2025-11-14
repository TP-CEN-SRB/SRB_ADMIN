"use client";
import React, { useState, useMemo } from "react";
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

// -------------------- TYPES --------------------
interface Disposal {
  id: string;
  createdAt: string;
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
  lat?: number;
  long?: number;
  bins: Bin[];
}

interface ScreenProps {
  binManager: BinManager;
}

// -------------------- COMPONENT --------------------
const ViewBinManagerScreen = ({ binManager }: ScreenProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All");

  // -------------------- HELPER FUNCTIONS --------------------
  const getHeartbeatStatus = (lastHeartBeat: string | null): "online" | "warning" | "offline" => {
    if (!lastHeartBeat) return "offline";
    const diffMinutes = (Date.now() - new Date(lastHeartBeat).getTime()) / 1000 / 60;
    if (diffMinutes < 10) return "online";
    if (diffMinutes < 30) return "warning";
    return "offline";
  };

  // Health score (based on uptime + capacity)
  const calculateHealthScore = (bins: Bin[]): number => {
    if (!bins.length) return 0;
    const scores = bins.map((bin) => {
      const status = getHeartbeatStatus(bin.lastHeartBeat);
      const uptimeScore = status === "online" ? 1 : status === "warning" ? 0.6 : 0.2;
      const capacityScore = 1 - Math.abs(bin.currentCapacity / 100 - 0.5); // balanced load
      return (uptimeScore * 0.7 + capacityScore * 0.3) * 100;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Flatten disposals & filter by bin type
  const disposals = useMemo(() => {
    const all = binManager.bins.flatMap((b) =>
      b.disposals.map((d) => ({
        ...d,
        material: b.binMaterial.name,
      }))
    );
    if (selectedMaterial === "All") return all;
    return all.filter((d) => d.material === selectedMaterial);
  }, [binManager.bins, selectedMaterial]);

  // -------------------- DATA AGGREGATION --------------------
  const monthData = useMemo(() => {
    return Object.values(
      disposals.reduce(
        (acc: Record<string, { month: string; count: number }>, d) => {
          const date = new Date(d.createdAt);
          if (date.getFullYear() !== selectedYear) return acc;
          const month = (date.getMonth() + 1).toString();
          if (!acc[month]) acc[month] = { month, count: 0 };
          acc[month].count++;
          return acc;
        },
        {}
      )
    );
  }, [disposals, selectedYear]);

  // Uptime trend per bin
  const uptimeTrend = binManager.bins.map((b) => {
    const status = getHeartbeatStatus(b.lastHeartBeat);
    const diffMins = b.lastHeartBeat
      ? (Date.now() - new Date(b.lastHeartBeat).getTime()) / 1000 / 60
      : 9999;
    const uptime =
      status === "online" ? 100 : status === "warning" ? 60 : 0;
    return {
      name: b.binMaterial.name,
      uptime,
      lastSeenMins: Math.round(diffMins),
    };
  });

  // -------------------- UI --------------------
  const healthScore = calculateHealthScore(binManager.bins);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 🧾 Quick Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">Overall Health Score</h3>
          <p
            className={`text-3xl font-bold ${
              healthScore > 90
                ? "text-green-600"
                : healthScore > 70
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {healthScore}%
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">Total Bins</h3>
          <p className="text-3xl font-bold">{binManager.bins.length}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">Active Year</h3>
          <p className="text-3xl font-bold text-blue-600">{selectedYear}</p>
        </div>
      </div>

      {/* 🩺 Bin Heartbeat Cards */}
      <section>
        <h2 className="text-lg font-bold mb-4">Bin Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {binManager.bins.map((bin) => {
            const status = getHeartbeatStatus(bin.lastHeartBeat);
            return (
              <HeartbeatBinCard
                key={bin.id}
                title={bin.binMaterial.name}
                percentage={bin.currentCapacity}
                status={status}
                lastActive={bin.lastHeartBeat}
                color={
                  status === "online"
                    ? "ring-green-400"
                    : status === "warning"
                    ? "ring-yellow-400"
                    : "ring-red-400"
                }
              />
            );
          })}
        </div>
      </section>

      {/* 📈 Disposal Trends */}
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Disposals by Month throughout {selectedYear}</h2>
          <div className="flex items-center gap-2">
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
            >
              <option value="All">All Materials</option>
              {Array.from(
                new Set(binManager.bins.map((b) => b.binMaterial.name))
              ).map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from(
                new Set(
                  binManager.bins
                    .flatMap((b) =>
                      b.disposals.map((d) =>
                        new Date(d.createdAt).getFullYear()
                      )
                    )
                    .sort((a, b) => b - a)
                )
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ⏱️ Uptime Trend */}
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-4">Uptime Trend by Bin</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={uptimeTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="uptime" stroke="#0284c7" />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default ViewBinManagerScreen;
