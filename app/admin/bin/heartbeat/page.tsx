"use client";

import { getHeartbeat } from "@/app/action/bin";
import { useEffect, useState } from "react";
import {
  FaHeartbeat,
  FaCamera,
  FaServer,
  FaTrash,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { Tooltip } from "react-tooltip";
import { publishMqtt, connectMqtt } from "@/lib/mqtt";

type Bin = Awaited<ReturnType<typeof getHeartbeat>>[number];

const handleMqttCommand = async (command: string) => {
  try {
    await publishMqtt("srb/power", JSON.stringify({ command }));
  } catch (err) {
    console.error("Failed to publish MQTT:", err);
  }
};

export default function SmartBinDashboard() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("all");

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      const data = await getHeartbeat();
      setBins(data);
    };
    fetchData();
  }, []);

  // Heartbeat MQTT listener
  useEffect(() => {
    let isMounted = true;

    const setupMqtt = async () => {
      try {
        const client = await connectMqtt();

        client.subscribe("srb/heartbeat", (err) => {
          if (err) console.error("Subscribe error:", err);
        });

        client.on("message", (topic, message) => {
          if (topic === "srb/heartbeat") {
            try {
              const payload = JSON.parse(message.toString());
              const { binId, material } = payload;

              if (!binId || !material || !isMounted) return;

              setBins((prevBins) =>
                prevBins.map((bin) =>
                  bin.id === binId && bin.material === material
                    ? {
                        ...bin,
                        isOnline: true,
                        lastHeartBeat: new Date(),
                      }
                    : bin
                )
              );
          } catch (err) {
            console.error("Invalid heartbeat message:", err);
          }
        }
      });
      } catch (err) {
        console.error("MQTT connection failed:", err);
      }
    };

    setupMqtt();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    setBins((prevBins) =>
      prevBins.map((bin) => {
        const last = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;
        const diff = now - last;
        return {
          ...bin,
          isOnline: diff < 300000, 
        };
      })
    );
  }, 5000); 

  return () => clearInterval(interval);
}, []);


  const userOptions = Array.from(
    new Map(bins.map((b) => [b.userId, b.user.name])).entries()
  ).map(([id, name]) => ({ id, name }));

  const filteredBins =
    selectedUserId === "all"
      ? bins
      : bins.filter((bin) => bin.userId === selectedUserId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Smart Bin Dashboard</h1>

      {/* Dropdown Filter */}
      <div className="mb-4">
        <label htmlFor="user-filter" className="mr-2 font-medium">
          Filter by Bin Owner:
        </label>
        <select
          id="user-filter"
          className="border px-3 py-1 rounded"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="all">All</option>
          {userOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBins.map((bin) => {
          const statusText = bin.isOnline ? "Online" : "Offline";
          const statusColor = bin.isOnline ? "text-green-500" : "text-red-500";
          const pulseClass = bin.isOnline
            ? "text-red-500 animate-pulse scale-125"
            : "text-gray-400";

          return (
            <div
              key={bin.id}
              className="p-4 rounded-2xl shadow border border-gray-200 bg-white flex flex-col items-center relative"
            >
              <div
                data-tooltip-id={`tooltip-${bin.id}`}
                data-tooltip-content={statusText}
              >
                <FaHeartbeat size={40} className={`mb-2 ${pulseClass}`} />
              </div>
              <Tooltip id={`tooltip-${bin.id}`} />

              <div className="text-lg mt-2">{bin.material}</div>
              <div className={`text-sm mt-1 ${statusColor}`}>
                {statusText}
              </div>

              {bin.lastHeartBeat && (
                <div className="text-xs text-gray-500 mt-1">
                  Last seen{" "}
                  {formatDistanceToNow(new Date(bin.lastHeartBeat), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <hr className="my-8 border-gray-300" />

      {/* Remote Power Controls */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Remote Power Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Power All */}
          <div className="col-span-1">
            <div className="text-sm font-medium mb-2">All Systems</div>
            <div className="flex gap-2">
              <button
                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleMqttCommand("on")}
              >
                ON
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleMqttCommand("off")}
              >
                OFF
              </button>
            </div>
          </div>

          {/* Camera */}
          <div className="text-center">
            <FaCamera className="text-3xl mx-auto mb-1 text-gray-700" />
            <div className="text-sm font-medium mb-2">Camera</div>
            <div className="flex gap-2 justify-center">
              <button
                className="px-3 py-1 bg-green-500 text-white rounded"
                onClick={() => handleMqttCommand("on1")}
              >
                ON
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleMqttCommand("off1")}
              >
                OFF
              </button>
            </div>
          </div>

          {/* Website */}
          <div className="text-center">
            <FaServer className="text-3xl mx-auto mb-1 text-gray-700" />
            <div className="text-sm font-medium mb-2">Website</div>
            <div className="flex gap-2 justify-center">
              <button
                className="px-3 py-1 bg-green-500 text-white rounded"
                onClick={() => handleMqttCommand("on2")}
              >
                ON
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleMqttCommand("off2")}
              >
                OFF
              </button>
            </div>
          </div>

          {/* Bins */}
          <div className="text-center">
            <FaTrash className="text-3xl mx-auto mb-1 text-gray-700" />
            <div className="text-sm font-medium mb-2">Bins</div>
            <div className="flex gap-2 justify-center">
              <button
                className="px-3 py-1 bg-green-500 text-white rounded"
                onClick={() => handleMqttCommand("on3")}
              >
                ON
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleMqttCommand("off3")}
              >
                OFF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
