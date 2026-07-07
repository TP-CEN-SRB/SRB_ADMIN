"use client"

export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { MqttClient } from "mqtt"
import { getHeartbeat } from "@/app/action/bin"
import { publishMqtt, connectMqtt } from "@/lib/mqtt"
import { toast } from "sonner"
import {
  FaHeartbeat,
  FaBatteryFull,
  FaPowerOff,
  FaClock,
} from "react-icons/fa"
import { Tooltip } from "react-tooltip"
import { formatDistanceToNow } from "date-fns"

type Bin = Awaited<ReturnType<typeof getHeartbeat>>[number]

export default function SmartBinDashboard() {
  const [bins, setBins] = useState<Bin[]>([])
  const [selectedUserId, setSelectedUserId] = useState("all")
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null)

  useEffect(() => {
    const init = async () => {
      const client = await connectMqtt()
      setMqttClient(client)
    }
    init()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHeartbeat()
        setBins(data)
      } catch (err) {
        console.error("Failed to fetch heartbeat data:", err)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleMqttCommand = async (command: "on" | "off" | "time") => {
    if (!mqttClient) {
      toast.success( "MQTT Not Connected", {
        description: "Client is not connected to the broker.",
      })
      return
    }

    const topic = "srb/power"
    const payload = JSON.stringify({ command })

    try {
      toast.success( `Sending \"${command}\"...`,{
        description: "Sending command to SRB Power system.",
      })

      const success = await publishMqtt(topic, payload)

      if (success) {
        toast.error( "Command Sent",{
          description:
            command === "on"
              ? "System switched to manual ON mode."
              : command === "off"
              ? "System switched to manual OFF mode."
              : "System switched to RTC time-managed mode.",
        })
      } else {
        toast.error( "MQTT Error",{
          description: `Failed to send \"${command}\".`,
        })
      }
    } catch (err) {
      console.error("MQTT Publish Error:", err)
      toast.error( "Unexpected Error",{
        description: `Something went wrong sending \"${command}\".`,
      })
    }
  }

  const binsWithUser = bins.filter(
    (bin): bin is Bin & { userId: string } =>
      "userId" in bin && typeof bin.userId === "string"
  )

  const userOptions = Array.from(
    new Map(binsWithUser.map((b) => [b.userId, b.userId])).entries()
  ).map(([id]) => ({ id, name: id }))

  const filteredBins =
    selectedUserId === "all"
      ? bins
      : binsWithUser.filter((bin) => bin.userId === selectedUserId)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Smart Bin Dashboard</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBins.map((bin) => {
          const statusText = bin.isOnline ? "Online" : "Offline"
          const statusColor = bin.isOnline ? "text-green-500" : "text-red-500"
          const pulseClass = bin.isOnline
            ? "text-red-500 animate-pulse scale-125"
            : "text-gray-400"

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

              <div className="text-lg mt-2">
                {"binMaterial" in bin &&
                bin.binMaterial &&
                typeof bin.binMaterial === "object" &&
                "name" in bin.binMaterial &&
                typeof bin.binMaterial.name === "string"
                  ? bin.binMaterial.name
                  : "Unknown Material"}
              </div>
              <div className={`text-sm mt-1 ${statusColor}`}>{statusText}</div>

              {bin.lastHeartBeat && (
                <div className="text-xs text-gray-500 mt-1">
                  Last seen {" "}
                  {formatDistanceToNow(new Date(bin.lastHeartBeat), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <hr className="my-8 border-gray-300" />

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Remote Power Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <FaBatteryFull className="text-3xl mx-auto mb-1 text-green-600" />
            <div className="text-sm font-medium mb-2">Manual On</div>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
              onClick={() => handleMqttCommand("on")}
            >
              ON
            </button>
          </div>

          <div>
            <FaPowerOff className="text-3xl mx-auto mb-1 text-red-600" />
            <div className="text-sm font-medium mb-2">Manual Off</div>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
              onClick={() => handleMqttCommand("off")}
            >
              OFF
            </button>
          </div>

          <div>
            <FaClock className="text-3xl mx-auto mb-1 text-blue-600" />
            <div className="text-sm font-medium mb-2">RTC Time Mode</div>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              onClick={() => handleMqttCommand("time")}
            >
              TIME MODE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
