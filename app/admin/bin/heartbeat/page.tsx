
import React from "react";
import HeartbeatBinCard from "@/components/Card/BinHeartbeatCard";

export default function Dashboard() {
  const bins = [
    { title: "Plastic", color: "ring-yellow-400", percentage: 12, status: "online" },
    { title: "Paper", color: "ring-blue-400", percentage: 0, status: "offline" },
    { title: "Metal", color: "ring-red-400", percentage: 45, status: "online" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Smart Bin Dashboard</h1>
      <div className="flex gap-6 flex-wrap">
        {bins.map((bin) => (
          <HeartbeatBinCard
            key={bin.title}
            title={bin.title}
            color={bin.color}
            percentage={bin.percentage}
            status={bin.status as "online" | "offline"}
          />
        ))}
      </div>
    </div>
  );
}
