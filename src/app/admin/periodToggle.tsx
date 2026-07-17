"use client"

import { Button } from "@/components/ui/button"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const periods = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]

export function DashboardPeriodToggle({ period }: { period: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex rounded-md border bg-background p-0.5">
      {periods.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant="ghost"
          className={cn("rounded-sm", period === p.value && "bg-muted")}
          onClick={() => onSelect(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}
