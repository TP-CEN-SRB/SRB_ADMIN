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

// ---------------------------------------
// TYPES
// ---------------------------------------
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

interface UptimeEntry {
  id: string;
  name: string;
  uptimePercent: number;
  uptimeTimeline: { timestamp: string; uptime: number }[];
}

interface BinManager {
  id: string;
  name: string;
  email: string;
  faculty: Faculty;
  lat?: number;     // ⬅️ FIX
  long?: number;    // ⬅️ FIX
  bins: Bin[];
}


interface ScreenProps {
  binManager: BinManager;
}

// -----------------------------------------------------
//   MAIN COMPONENT STARTS HERE
// -----------------------------------------------------
const ViewBinManagerScreen = ({ binManager }: ScreenProps) => {
  // Live heartbeat bin data
  const [liveBins, setLiveBins] = useState<Bin[]>(binManager.bins);

  // Uptime overview + timeline
  const [uptimeData, setUptimeData] = useState<UptimeEntry[]>([]);

  // Filter states
  const [selectedRange, setSelectedRange] = useState("hour");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Selected bin for detailed timeline
  const [selectedBinId, setSelectedBinId] = useState<string>(
    binManager.bins[0]?.id
  );

  // Find selected bin uptime timeline
  const selectedBin = uptimeData.find((b) => b.id === selectedBinId);

    // -----------------------------------------------------
  // ONLINE / OFFLINE STATUS CHECK
  // -----------------------------------------------------
  const getStatus = (lastHeartBeat: string | null) => {
    if (!lastHeartBeat) return "offline";
    const diff = (Date.now() - new Date(lastHeartBeat).getTime()) / 60000;
    return diff < 10 ? "online" : "offline";
  };

  // -----------------------------------------------------
  // HEALTH SCORE (% of bins online)
  // -----------------------------------------------------
  const healthScore = useMemo(() => {
    if (!liveBins.length) return 0;

    const upCount = liveBins.filter(
      (b) => getStatus(b.lastHeartBeat) === "online"
    ).length;

    return Math.round((upCount / liveBins.length) * 100);
  }, [liveBins]);

  // -----------------------------------------------------
  // DISPOSAL TRENDS
  // -----------------------------------------------------
  const disposals = useMemo(() => {
    const all = liveBins.flatMap((b) =>
      b.disposals.map((d) => ({ ...d, material: b.binMaterial.name }))
    );

    return selectedMaterial === "All"
      ? all
      : all.filter((d) => d.material === selectedMaterial);
  }, [liveBins, selectedMaterial]);

  // -----------------------------------------------------
  // GROUP DISPOSALS BY MONTH (for Disposal Trends graph)
  // -----------------------------------------------------
  const monthData = useMemo(() => {
    const grouped: Record<string, { month: string; count: number }> = {};

    disposals.forEach((d) => {
      const date = new Date(d.createdAt);
      if (date.getFullYear() !== selectedYear) return;

      const month = (date.getMonth() + 1).toString();

      if (!grouped[month]) grouped[month] = { month, count: 0 };
      grouped[month].count++;
    });

    return Object.values(grouped);
  }, [disposals, selectedYear]);

  // -----------------------------------------------------
  // AUTO-REFRESH: BIN STATUS + REAL UPTIME DATA
  // -----------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ⚡ 1. Fetch real-time bin heartbeat/status
        const binRes = await fetch(
          `/api/bin-data?managerId=${binManager.id}`
        );
        const binData = await binRes.json();

        if (Array.isArray(binData)) {
          setLiveBins((prev) =>
            prev.map((b) => {
              const upd = binData.find((x: any) => x.id === b.id);
              return upd ? { ...b, ...upd } : b;
            })
          );
        }

        // ⚡ 2. Fetch uptime timeline (5-min buckets → compressed)
        const uptimeRes = await fetch(
          `/api/uptime?managerId=${binManager.id}&range=${selectedRange}`
        );
        const uptimeJson = await uptimeRes.json();

        if (Array.isArray(uptimeJson)) {
          setUptimeData(
            uptimeJson.map((u: any) => ({
              id: u.id,
              name: u.name,
              uptimePercent: u.uptimePercent,
              uptimeTimeline: u.uptimeTimeline || [],
            }))
          );
        }

        // ⚡ Ensure selectedBinId stays valid even if bins change
        if (
          uptimeJson.length > 0 &&
          !uptimeJson.find((b: any) => b.id === selectedBinId)
        ) {
          setSelectedBinId(uptimeJson[0].id);
        }
      } catch (error) {
        console.error("❌ Auto-refresh failed:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [binManager.id, selectedRange, selectedBinId]);

    // -----------------------------------------------------
  // UI START
  // -----------------------------------------------------
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ============================
          1. STAT CARDS
      ============================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow text-center">
          <h3 className="text-sm font-semibold text-gray-500">
            Overall Health
          </h3>
          <p
            className={`text-3xl font-bold ${
              healthScore >= 80 ? "text-green-600" : "text-red-500"
            }`}
          >
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

      {/* ============================
          2. BIN STATUS CARDS
      ============================ */}
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
                color={
                  status === "online" ? "ring-green-400" : "ring-red-400"
                }
              />
            );
          })}
        </div>
      </section>

      {/* ============================
          3. MONTHLY DISPOSAL TRENDS
      ============================ */}
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            Disposals by Month ({selectedYear})
          </h2>

          <div className="flex gap-2">
            {/* MATERIAL FILTER */}
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
            >
              <option value="All">All Materials</option>
              {Array.from(new Set(liveBins.map((b) => b.binMaterial.name))).map(
                (mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                )
              )}
            </select>

            {/* YEAR FILTER */}
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {Array.from(
                new Set(
                  liveBins
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

      {/* ============================
          4. OVERALL UPTIME (%)
      ============================ */}
      <section className="border p-6 rounded-xl bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-4">Uptime Overview (%)</h2>

        <div className="flex flex-col gap-3">
          {uptimeData.map((bin) => (
            <div key={bin.id} className="flex items-center gap-4">
              <span className="font-semibold w-32">{bin.name}</span>

              <span
                className={`font-bold ${
                  bin.uptimePercent >= 80
                    ? "text-green-600"
                    : bin.uptimePercent >= 50
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {bin.uptimePercent}% uptime
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================
          5. DETAILED TIMELINE (PER BIN)
      ============================ */}
      <section className="border p-6 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Detailed Timeline</h2>

          <div className="flex gap-3">
            {/* BIN SELECT */}
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedBinId}
              onChange={(e) => setSelectedBinId(e.target.value)}
            >
              {uptimeData.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* RANGE SELECT */}
            <select
              className="border px-3 py-1 rounded text-sm"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option value="hour">Past Hour</option>
              <option value="day">Past Day</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>
        </div>

        {/* TIMELINE GRAPH */}
        {selectedBin && (
          <div className="overflow-x-auto">
            <div className="min-w-[600px] flex gap-[2px]">
              {selectedBin.uptimeTimeline.map((entry, idx) => {
                const color =
                  entry.uptime === 100
                    ? "bg-green-500"
                    : entry.uptime === 0
                    ? "bg-red-500"
                    : "bg-yellow-500";

                return (
                  <div
                    key={idx}
                    className={`h-10 w-2 rounded ${color}`}
                    title={`${entry.timestamp} — ${entry.uptime}%`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewBinManagerScreen;
