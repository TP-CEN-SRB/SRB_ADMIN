import Link from "next/link"
import { Suspense } from "react"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { getAllPowerSchedules } from "@/app/action/bin"
import { ScheduleActions } from "./schedule-actions"

// Same static-prerendering trap as the map/test-bins pages: no headers()/
// cookies() call here for Next to key off, so this got frozen at build time
// and wouldn't reflect schedules created/deleted (or their bin manager
// deleted) afterward.
export const dynamic = "force-dynamic"

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export default function PowerSchedulesPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold">Power Schedules</h1>
          <p className="text-sm text-muted-foreground">
            Each bin manager&apos;s Pi can run its own power schedule. Bins with no
            schedule of their own fall back to the global default below.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/bin/schedule/create">
            <CalendarPlus className="mr-2 size-4" />
            Create Schedule
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton columns={6} />}>
        <SchedulesTable />
      </Suspense>
    </div>
  )
}

async function SchedulesTable() {
  const schedules = await getAllPowerSchedules()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bin Manager</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-center">Enabled</TableHead>
          <TableHead className="text-center">Power-On Window</TableHead>
          <TableHead>Active Days</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              No schedules found.
            </TableCell>
          </TableRow>
        ) : (
          schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                <span className="text-xs">{schedule.user?.name ?? "Global Default"}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{schedule.user?.location ?? "All unassigned bins"}</span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={schedule.enabled ? "default" : "outline"}>
                  {schedule.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-xs">
                  {formatMinutes(schedule.startMinute)} &ndash; {formatMinutes(schedule.endMinute)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs">
                  {schedule.days.length === 7
                    ? "Every day"
                    : schedule.days.map((d) => dayLabels[d]).join(", ")}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <ScheduleActions scheduleId={schedule.id} isDefault={schedule.userId === null} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
