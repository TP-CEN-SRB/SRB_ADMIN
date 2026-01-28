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


// Convert UTC → Singapore Time (SGT/UTC+8)
const toSGT = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatUptimeLabel = (timestampUTC: string, range: string) => {
  const date = new Date(timestampUTC);

  if (range === "year") {
    return date.toLocaleString("en-SG", { month: "short" });
  }

  if (range === "month") {
    return date.toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
    });
  }

  if (range === "day") {
    return date.toLocaleString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

interface UptimeTimelineEntry {
  timestampUTC: string;   // ISO timestamp (backend bucket)
  timestampSGT: string;   // Formatted for display
  label: string;          // Clean chart label ("03:25", "12", "04", etc.)
  uptime: number;         // 0–100%
}

interface UptimeEntry {
  id: string;
  name: string;
  uptimePercent: number;
  uptimeTimeline: UptimeTimelineEntry[];
}


interface BinManager {
  id: string;
  name: string;
  email: string;
  faculty: Faculty;
  location?: string;   // ✅ optional, safe
  lat?: number;
  long?: number;
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

  const availableYears = useMemo(() => {
  const yearsFromData = new Set<number>();

  liveBins.forEach((b) => {
    b.disposals.forEach((d) => {
      yearsFromData.add(new Date(d.createdAt).getFullYear());
    });
  });

  const currentYear = new Date().getFullYear();
  yearsFromData.add(currentYear); // 👈 ensure current year is always selectable

  return Array.from(yearsFromData).sort((a, b) => b - a);
}, [liveBins]);


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
  // Initialize all 12 months with 0
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: (i + 1).toString(),
    count: 0,
  }));

  disposals.forEach((d) => {
    const date = new Date(d.createdAt);
    if (date.getFullYear() !== selectedYear) return;

    const monthIndex = date.getMonth(); // 0–11
    months[monthIndex].count++;
  });

  return months;
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
              uptimeTimeline: (u.uptimeTimeline || []).map((entry: any) => {
                return {
                    timestampUTC: entry.timestampUTC,   // from backend
                    timestampSGT: entry.timestampSGT,   // already formatted
                    label: entry.label,                 // already generated
                    uptime: entry.uptime, 
                };
              }),
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
              MANAGER INFO HEADER
          ============================ */}
          <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {binManager.name}
            </h1>

            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>📍</span>
              <span>
                {binManager.location
                  ? binManager.location
                  : binManager.lat && binManager.long
                  ? `${binManager.lat.toFixed(5)}, ${binManager.long.toFixed(5)}`
                  : "Location not available"}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              {binManager.email}
            </div>
          </div>
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
              {availableYears.map((year) => (
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
        <h2 className="text-lg font-bold mb-4">
          Uptime Overview (Aggregated Over Past {
            selectedRange === "hour"
              ? "Hour"
              : selectedRange === "day"
              ? "Day"
              : selectedRange === "month"
              ? "Month"
              : "Year"
          })
        </h2>

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
      ============================= */}
      <section className="border p-6 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Uptime Timeline</h2>

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

        {/* EMPTY STATE (NO LOGS) */}
        {(!selectedBin || selectedBin.uptimeTimeline.length === 0) && (
          <div className="p-6 text-center text-gray-500">
            <p className="font-medium">No uptime data available for this range.</p>
            <p className="text-sm">(This bin may have been newly added or inactive.)</p>
          </div>
        )}

        {/* TIMELINE GRAPH */}
        {selectedBin && selectedBin.uptimeTimeline.length > 0 && (
          <div className="overflow-x-auto">

            {/* LEGEND */}
            <div className="flex gap-6 mb-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-green-500 rounded-sm"></span> Online (100%)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-yellow-500 rounded-sm"></span> Partial / Mixed
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-red-500 rounded-sm"></span> Offline (0%)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-gray-300 rounded-sm"></span> No Data
              </div>
            </div>

            {/* Bars */}
            <div className="flex gap-[4px] pb-3 border-b min-w-full">
              {selectedBin.uptimeTimeline.map((entry, idx) => {
                const { uptime } = entry;
                const colorClass =
                  uptime === null
                    ? "bg-gray-300"          // No Data
                    : uptime === 100
                    ? "bg-green-500"         // Online
                    : uptime === 0
                    ? "bg-red-500"           // Offline
                    : "bg-yellow-500";       // Partial / Mixed

                return (
                  <div
                    key={idx}
                    className={`h-14 w-3 rounded-sm ${colorClass} hover:scale-105 transition`}
                    title={
                        uptime === null
                          ? `${entry.timestampSGT} — No Data`
                          : `${entry.timestampSGT} — ${uptime}%`
                      }
                  />
                );
              })}
            </div>

            {/* Smarter X-axis labels (only 6 evenly spaced labels) */}
            <div className="flex mt-2 text-[10px] text-gray-500 select-none">
              {selectedBin.uptimeTimeline.map((entry, idx) => {
                const total = selectedBin.uptimeTimeline.length;

                const MAX_LABELS =
                  selectedRange === "hour" ? 4 :
                  selectedRange === "day" ? 6 :
                  selectedRange === "month" ? 6 :
                  12;

                const interval = Math.ceil(total / MAX_LABELS);
                const show = idx % interval === 0;

                return (
                  <div
                    key={idx}
                    className={`w-6 text-center ${
                      selectedRange === "year" || selectedRange === "month"
                        ? "rotate-45 origin-left"
                        : ""
                    }`}
                  >
                    {show
                      ? formatUptimeLabel(entry.timestampUTC, selectedRange)
                      : ""}
                  </div>
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
