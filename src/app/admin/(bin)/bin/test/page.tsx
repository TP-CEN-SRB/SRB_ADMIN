"use client"

import { useState } from "react"
import { publishMqtt } from "@/lib/mqtt"
import {
  ableToPublishMqttMessage,
  updateCommandUpdatedAt,
  resetCommandCooldown,
} from "@/utils/mqttPublisher"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const materials = ["plastic", "general", "paper"] as const
type Material = (typeof materials)[number]

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

const materialLabels: Record<Material, string> = {
  plastic: "Plastic",
  general: "General",
  paper: "Paper",
}

export default function TestBinPage() {
  const [binId, setBinId] = useState("")
  const [pendingCommand, setPendingCommand] = useState<string | null>(null)

  const sendCommand = async (material: Material, command: string) => {
    if (!binId) {
      toast.error("Missing Bin ID")
      return
    }

    const key = `${material}:${command}`
    setPendingCommand(key)

    const canPublish = await ableToPublishMqttMessage(binId)
    if (!canPublish) {
      toast.error("Cooldown active", {
        description: `Wait before sending another command to ${materialLabels[material]}`,
      })
      setPendingCommand(null)
      return
    }

    const topic = `srb/${material}/${binId}`
    const success = await publishMqtt(topic, JSON.stringify({ command }))

    if (success) {
      await updateCommandUpdatedAt(binId)
      toast.success(`Sent "${command}" to ${materialLabels[material]}`)
    } else {
      toast.error("Failed to send command", {
        description: `Could not reach the ${materialLabels[material]} bin`,
      })
    }

    setPendingCommand(null)
  }

  const handleResetCooldown = async function(){
    if (!binId) {
      toast.error("Missing Bin ID")
      return
    }
    await resetCommandCooldown(binId)
    toast.success("Cooldown reset", {
      description: "You can now send commands immediately",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bin Test Panel</h1>
        <p className="text-sm text-muted-foreground">
          Send commands directly to a bin&apos;s materials over the same MQTT
          topics the Pi bridge listens on.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-xl">
        <Input
          placeholder="Enter Bin ID"
          value={binId}
          onChange={(e) => setBinId(e.target.value)}
        />
        <Button variant="outline" onClick={handleResetCooldown}>
          Reset Cooldown
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {materials.map((material) => (
          <Card key={material}>
            <CardHeader>
              <CardTitle>{materialLabels[material]}</CardTitle>
              <CardDescription>
                Topic: srb/{material}/{binId || "<binId>"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {commands.map((command) => {
                const key = `${material}:${command.value}`
                const isPending = pendingCommand === key
                return (
                  <Button
                    key={command.value}
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => sendCommand(material, command.value)}
                  >
                    {isPending && <Loader2 className="mr-2 size-3 animate-spin" />}
                    {command.label}
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
