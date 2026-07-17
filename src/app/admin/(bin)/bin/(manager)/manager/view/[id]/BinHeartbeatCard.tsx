"use client"

import { formatDistanceToNow } from "date-fns"

type HeartbeatBinCardProps = {
  title: string                     // Bin title (e.g. "Plastic Bin")
  color: string                     // Tailwind ring color, e.g. 'ring-red-400'
  percentage: number                // Fill percentage
  status: "online" | "offline" | "warning" // ⬅️ Add warning here
  lastActive?: string | null        // Last heartbeat timestamp
}

export default function HeartbeatBinCard({
  title,
  color,
  percentage,
  status,
  lastActive,
}: HeartbeatBinCardProps) {
  const statusColor =
      status === "online"
        ? "text-green-600"
        : status === "warning"
        ? "text-yellow-500"
        : "text-red-500"


  return (
    <div className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-white shadow-md border w-[140px]">
      {/* Outer Circle with heartbeat image */}
      <div
        className={`relative w-20 h-20 rounded-full border-4 ${color} flex items-center justify-center`}
      >
        <img
          src="/heartbeat.png"
          alt="heartbeat"
          className={`w-10 h-10 opacity-80 ${
            status === "online" ? "animate-pulse" : "opacity-30"
          }`}
        />
        {/* Percent Overlay */}
        <div className="absolute bottom-1 text-sm font-semibold text-gray-700">
          {percentage}%
        </div>
      </div>

      {/* Title */}
      <div className="text-sm font-medium text-gray-700 text-center">
        {title}
      </div>

      {/* Status */}
      <div className={`text-xs font-semibold ${statusColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>


      {/* Last Active */}
      {lastActive && (
        <div className="text-[10px] text-gray-500 text-center">
          Last seen{" "}
          {formatDistanceToNow(new Date(lastActive), {
            addSuffix: true,
          })}
        </div>
      )}
    </div>
  )
}
