"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"

import { updatePowerSchedule } from "@/app/action/bin"

const dayLabels = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

interface ScheduleFormProps {
  initialData: {
    enabled: boolean
    startMinute: number
    endMinute: number
    days: number[]
  }
  userId?: string | null
  redirectTo?: string
}

export function ScheduleForm({ initialData, userId = null, redirectTo = "/admin/bin/schedule" }: ScheduleFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [enabled, setEnabled] = useState(initialData.enabled)
  const [range, setRange] = useState<[number, number]>([initialData.startMinute, initialData.endMinute])
  const [days, setDays] = useState<number[]>(initialData.days)

  function toggleDay(value: number) {
    setDays((current) =>
      current.includes(value) ? current.filter((d) => d !== value) : [...current, value].sort()
    )
  }

  function onSubmit() {
    startTransition(async function () {
      const result = await updatePowerSchedule({
        enabled,
        startMinute: range[0],
        endMinute: range[1],
        days,
        userId,
      })

      if (result?.success) {
        toast.success("Success", { description: result.success })
        router.push(redirectTo)
      } else if (result?.error) {
        toast.error("Error", { description: result.error })
      }
    })
  }

  const wrapsMidnight = range[0] > range[1]

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div>
          <Label>Schedule Enabled</Label>
          <p className="text-sm text-muted-foreground">
            When off, bins stay powered on at all times.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Power On Window</Label>
          <span className="text-sm text-muted-foreground">
            {formatMinutes(range[0])} &ndash; {formatMinutes(range[1])}
            {wrapsMidnight && " (overnight)"}
          </span>
        </div>
        <Slider
          min={0}
          max={1439}
          step={5}
          value={range}
          onValueChange={(value) => setRange([value[0], value[1]] as [number, number])}
          disabled={isPending || !enabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>00:00</span>
          <span>23:59</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Active Days</Label>
        <div className="flex flex-wrap gap-2">
          {dayLabels.map((day) => (
            <Button
              key={day.value}
              type="button"
              size="sm"
              variant={days.includes(day.value) ? "default" : "outline"}
              disabled={isPending || !enabled}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </Button>
          ))}
        </div>
      </div>

      <Button disabled={isPending} onClick={onSubmit}>
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Save className="mr-2 size-4" />
        )}
        {isPending ? "Saving..." : "Save Schedule"}
      </Button>
    </div>
  )
}
