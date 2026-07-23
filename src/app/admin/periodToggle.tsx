"use client"

import { Button } from "@/components/ui/button"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const periods = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]

interface DashboardPeriodToggleProps {
  period: string
  offset: number
  rangeLabel: string
}

export function DashboardPeriodToggle({ period, offset, rangeLabel }: DashboardPeriodToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onSelectPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", value)
    params.delete("offset")
    router.push(`${pathname}?${params.toString()}`)
  }

  function onNavigate(direction: -1 | 1) {
    const params = new URLSearchParams(searchParams.toString())
    const nextOffset = Math.min(0, offset + direction)
    params.set("offset", String(nextOffset))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="size-8" onClick={() => onNavigate(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">{rangeLabel}</span>
        <Button variant="outline" size="icon" className="size-8" onClick={() => onNavigate(1)} disabled={offset === 0}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex rounded-md border bg-background p-0.5">
        {periods.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant="ghost"
            className={cn("rounded-sm", period === p.value && "bg-muted")}
            onClick={() => onSelectPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
