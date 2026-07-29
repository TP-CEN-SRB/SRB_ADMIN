"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScheduleForm } from "@/components/FormLogic/(Misc)/ScheduleForm"

type BinManager = {
  id: string
  name: string
  location: string | null
}

export function CreateScheduleForm({ managers }: { managers: BinManager[] }) {
  const [selectedId, setSelectedId] = useState<string>("")

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-2">
        <Label>Bin Manager (Raspberry Pi)</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a bin manager to connect to" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.name} &mdash; {manager.location ?? "no location"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New Power Schedule</CardTitle>
            <CardDescription>
              This schedule will be pushed to that bin manager&apos;s relay only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleForm
              key={selectedId}
              initialData={{
                enabled: false,
                startMinute: 0,
                endMinute: 1439,
                days: [0, 1, 2, 3, 4, 5, 6],
              }}
              userId={selectedId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
