"use client"

import { useState } from "react"
import { toast } from "sonner"
import { publishMqtt } from "@/lib/mqtt"
import {
  ableToPublishMqttMessage,
  updateCommandUpdatedAt,
  resetCommandCooldown,
} from "@/utils/mqttPublisher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Trash2 } from "lucide-react"

const commands = [
  { label: "Open Lid", value: "open" },
  { label: "Close Lid", value: "close" },
  { label: "Raise Bin", value: "up" },
  { label: "Lower Bin", value: "down" },
  { label: "Read Fill Level", value: "ultrasound" },
  { label: "Open Detection", value: "opendetection" },
  { label: "Close Detection", value: "closedetection" },
  { label: "Detect", value: "detect" },
  { label: "Multi-Detect", value: "multi-detect" },
] as const

type BinManager = {
  id: string
  name: string
  location: string | null
  bins: {
    id: string
    status: string
    currentCapacity: number
    binMaterial: { name: string }
  }[]
}

export function BinTestGrid({ managers }: { managers: BinManager[] }) {
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const sendCommand = async (managerId: string, materialName: string, command: string) => {
    const material = materialName.toLowerCase()
    const key = `${managerId}:${material}:${command}`
    setPendingKey(key)

    const canPublish = await ableToPublishMqttMessage(managerId)
    if (!canPublish) {
      toast.error("Cooldown active", {
        description: `Wait before sending another command to ${materialName}`,
      })
      setPendingKey(null)
      return
    }

    const topic = `srb/${material}/${managerId}`
    const success = await publishMqtt(topic, JSON.stringify({ command }))

    if (success) {
      await updateCommandUpdatedAt(managerId)
      toast.success(`Sent "${command}" to ${materialName}`)
    } else {
      toast.error("Failed to send command", {
        description: `Could not reach the ${materialName} bin`,
      })
    }

    setPendingKey(null)
  }

  const handleResetCooldown = async (managerId: string) => {
    await resetCommandCooldown(managerId)
    toast.success("Cooldown reset", {
      description: "You can now send commands immediately",
    })
  }

  if (managers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No bin managers found.</p>
    )
  }

  return (
    <div className="space-y-8">
      {managers.map((manager) => (
        <div key={manager.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{manager.name}</h2>
              <p className="text-sm text-muted-foreground">
                {manager.location ?? "No location set"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleResetCooldown(manager.id)}>
              Reset Cooldown
            </Button>
          </div>

          {manager.bins.length === 0 ? (
            <p className="text-sm text-muted-foreground">This manager has no bins.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {manager.bins.map((bin) => {
                const materialName = bin.binMaterial.name
                return (
                  <DropdownMenu key={bin.id}>
                    <DropdownMenuTrigger asChild>
                      <Card className="cursor-pointer transition-colors hover:bg-accent">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between text-base">
                            <span className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              {materialName}
                            </span>
                            <Badge variant={bin.status === "FUNCTIONAL" ? "default" : "destructive"}>
                              {bin.status === "FUNCTIONAL" ? "OK" : "Maintenance"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(bin.currentCapacity)}% full
                          </p>
                        </CardContent>
                      </Card>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {commands.map((command) => {
                        const key = `${manager.id}:${materialName.toLowerCase()}:${command.value}`
                        const isPending = pendingKey === key
                        return (
                          <DropdownMenuItem
                            key={command.value}
                            disabled={isPending}
                            onSelect={(e) => {
                              e.preventDefault()
                              sendCommand(manager.id, materialName, command.value)
                            }}
                          >
                            {isPending && <Loader2 className="mr-2 size-3 animate-spin" />}
                            {command.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
