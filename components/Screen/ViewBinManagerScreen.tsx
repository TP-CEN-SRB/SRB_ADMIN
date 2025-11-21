"use client";

import React, { useState, useEffect, useMemo } from "react";
import HeartbeatBinCard from "../Card/BinHeartbeatCard";
import { Faculty } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ----------- TYPES -----------
interface Disposal {
  id: string;
  createdAt: string;
  weightInGrams: number;
  carbonprint: number;
}
interface Bin {
  id: string;
  status: string;
  currentCapacity: number;
  lastHeartBeat: string | null;
  binMaterial: { id: string; name: string };
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

// ----------- COMPONENT -----------
const ViewBinManagerScreen = ({ binManager }: ScreenProps) => {
  const [liveBins, setLiveBins] = useState<Bin[]>(binManager.bins);
  const [uptimeData, setUptimeData] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRange, setSelectedRange] = useState("hour");

  // ---- Online/offline check ----
  const getStatus = (lastHeartBeat: string | null) => {
    if (!lastHeartBeat) return "offline";
    const diff = (Date.now() - new Date(lastHeartBeat).getTime()) / 60000;
    return diff < 10 ? "online" : "offline";
  };

  // ---- Health score ----
  const healthScore = useMemo(() => {
    if (!liveBins.length) return 0;
    const scores = liveBins.map((b) => (getStatus(b.lastHeartBeat) === "online" ? 1 : 0));
    return Math.round((scores.reduce((a: number, b: number) => a + b, 0) / liveBins.length) * 100);
  }, [liveBins]);

  // ---- Disposal trends ----
  const disposals = useMemo(() => {
    const all = liveBins.flatMap((b) =>
      b.disposals.map((d) => ({ ...d, material: b.binMaterial.name }))
    );
    return selectedMaterial === "All" ? all : all.filter((d) => d.material === selectedMaterial);
  }, [liveBins, selectedMaterial]);

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

// ---- Auto-refresh + real uptime ----
useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch bin heartbeat data
      const res = await fetch(`/api/bin-data?managerId=${binManager.id}`);
      const binData = await res.json();

      // Fetch real uptime data
      const uptimeRes = await fetch(
        `/api/uptime?managerId=${binManager.id}&range=${selectedRange}`
      );
      const uptimeDataJson = await uptimeRes.json();

      if (Array.isArray(binData) && Array.isArray(uptimeDataJson)) {
        // update live bins
        setLiveBins((prev) =>
          prev.map((b) => {
            const update = binData.find((x) => x.id === b.id);
            return update ? { ...b, ...update } : b;
          })
        );

        // merge uptime data for chart
        const merged = binManager.bins.map((b) => {
          const match = uptimeDataJson.find((u: any) => u.id === b.id);
          return {
            name: b.binMaterial.name,
            uptime: match ? match.uptime : 0,
          };
        });

        setUptimeData(merged);
      }
    } catch (err) {
      console.error("⚠️ Auto-refresh or uptime fetch error:", err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 5000);
  return () => clearInterval(interval);
}, [binManager.id, selectedRange]);

  // ---- UI ----
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">Overall Health</h3>
          <p className={`text-3xl font-bold ${healthScore >= 80 ? "text-green-600" : "text-red-500"}`}>
            {healthScore}%
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">Total Bins</h3>
          <p className="text-3xl font-bold">{liveBins.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">Active Year</h3>
          <p className="text-3xl font-bold text-blue-600">{selectedYear}</p>
        </div>
      </div>

      {/* Bin Cards */}
      <section>
        <h2 className="text-lg font-bold mb-4">Bin Status Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveBins.map((bin) => {
            const status = getStatus(bin.lastHeartBeat);
            return (
              <HeartbeatBinCard
                key={bin.id}
                title={bin.binMaterial.name}
                percentage={bin.currentCapacity}
                status={status}
                lastActive={bin.lastHeartBeat}
                color={status === "online" ? "ring-green-400" : "ring-red-400"}
              />
            );
          })}
        </div>
      </section>

      {/* Disposal Trends */}
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Disposals by Month ({selectedYear})</h2>
          <div className="flex gap-2">
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
            >
              <option value="All">All Materials</option>
              {Array.from(new Set(liveBins.map((b) => b.binMaterial.name))).map((mat) => (
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
                  liveBins
                    .flatMap((b) => b.disposals.map((d) => new Date(d.createdAt).getFullYear()))
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

      {/* Uptime Trend */}
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Uptime Trend by Bin</h2>
          <select
            className="border px-3 py-1 rounded text-sm"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="hour">Past Hour</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={uptimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="uptime" stroke="#10b981" name="Uptime %" />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default ViewBinManagerScreen;
