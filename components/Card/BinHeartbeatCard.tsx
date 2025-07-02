import React from "react";

type HeartbeatBinCardProps = {
  title: string;
  color: string; // tailwind ring color, e.g. 'ring-red-400'
  percentage: number;
  status: "online" | "offline";
};

export default function HeartbeatBinCard({
  title,
  color,
  percentage,
  status,
}: HeartbeatBinCardProps) {
  const statusColor = status === "online" ? "text-green-600" : "text-red-500";

  return (
    <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white shadow-sm w-[120px]">
      {/* Outer Circle with color ring */}
      <div className={`relative w-20 h-20 rounded-full border-4 ${color} flex items-center justify-center`}>
        {/* Heartbeat Image Inside */}
        <img
          src="/heartbeat.png"
          alt="heartbeat"
          className="w-10 h-10 opacity-80 animate-pulse"
        />
        {/* Percent Overlay */}
        <div className="absolute bottom-1 text-sm font-semibold text-gray-700">
          {percentage}%
        </div>
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-700 text-center">{title}</div>

      {/* Status */}
      <div className={`text-xs font-medium ${statusColor}`}>{status}</div>
    </div>
  );
}
