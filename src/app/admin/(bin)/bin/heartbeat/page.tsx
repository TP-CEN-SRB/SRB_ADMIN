"use client"

export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { MqttClient } from "mqtt"
import { getHeartbeat } from "./action"
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

// 1. Import the shadcn Button component
import { Button } from "@/components/ui/button" 

type Bin = Awaited<ReturnType<typeof getHeartbeat>>[number]

export default function SmartBinDashboard() {
  const [bins, setBins] = useState<Bin[]>([])
  const [selectedUserId, setSelectedUserId] = useState("all")
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null)

  useEffect(function(){
    let client: MqttClient | null = null;
    
    const init = async function(){
      client = await connectMqtt()
      setMqttClient(client)
    }
    init()

    // 2. Added cleanup function to prevent ghost connections when navigating away
    return function(){
      if (client) {
        client.end()
      }
    }
  }, [])

  useEffect(function(){
    const fetchData = async function(){
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
      toast.error("MQTT Not Connected", {
        description: "Client is not connected to the broker.",
      })
      return
    }

    const topic = "srb/power"
    const payload = JSON.stringify({ command })

    try {
      toast.success(`Sending "${command}"...`, {
        description: "Sending command to SRB Power system.",
      })

      const success = await publishMqtt(topic, payload)

      if (success) {
        toast.success("Command Sent", {
          description:
            command === "on"
              ? "System switched to manual ON mode."
              : command === "off"
              ? "System switched to manual OFF mode."
              : "System switched to RTC time-managed mode.",
        })
      } else {
        toast.error("MQTT Error", {
          description: `Failed to send "${command}".`,
        })
      }
    } catch (err) {
      console.error("MQTT Publish Error:", err)
      toast.error("Unexpected Error", {
        description: `Something went wrong sending "${command}".`,
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
    // Applied text-foreground for global text theming
    <div className="h-full w-full overflow-y-auto pb-8 text-foreground">
      <h1 className="text-2xl font-bold mb-6">Smart Bin Dashboard</h1>

      <div className="mb-6 flex items-center gap-3">
        <label htmlFor="user-filter" className="font-medium text-sm">
          Filter by Bin Owner:
        </label>
        <select
          id="user-filter"
          // Styled to match shadcn inputs
          className="flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
          const statusColor = bin.isOnline ? "text-green-500" : "text-destructive"
          const pulseClass = bin.isOnline
            ? "text-red-500 animate-pulse scale-125"
            : "text-muted-foreground" // adapted for dark mode

          return (
            <div
              key={bin.id}
              // Swapped to bg-card, text-card-foreground, and border-border
              className="p-4 rounded-2xl shadow-sm border border-border bg-card text-card-foreground flex flex-col items-center relative transition-colors"
            >
              <div
                data-tooltip-id={`tooltip-${bin.id}`}
                data-tooltip-content={statusText}
              >
                <FaHeartbeat size={40} className={`mb-2 ${pulseClass}`} />
              </div>
              <Tooltip id={`tooltip-${bin.id}`} />

              <div className="text-lg mt-2 font-medium">
                {"binMaterial" in bin &&
                bin.binMaterial &&
                typeof bin.binMaterial === "object" &&
                "name" in bin.binMaterial &&
                typeof bin.binMaterial.name === "string"
                  ? bin.binMaterial.name
                  : "Unknown Material"}
              </div>
              <div className={`text-sm mt-1 font-medium ${statusColor}`}>{statusText}</div>

              {bin.lastHeartBeat && (
                <div className="text-xs text-muted-foreground mt-1">
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

      <hr className="my-8 border-border" />

      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-6">Remote Power Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <FaBatteryFull className="text-3xl text-green-500" />
            <div className="text-sm font-medium">Manual On</div>
            {/* Replaced native button with shadcn Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleMqttCommand("on")}
            >
              ON
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <FaPowerOff className="text-3xl text-destructive" />
            <div className="text-sm font-medium">Manual Off</div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleMqttCommand("off")}
            >
              OFF
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <FaClock className="text-3xl text-blue-500" />
            <div className="text-sm font-medium">RTC Time Mode</div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleMqttCommand("time")}
            >
              TIME MODE
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}