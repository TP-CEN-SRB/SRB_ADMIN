import Link from "next/link"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getEligibleBinManagersForSchedule } from "@/app/action/bin"
import { CreateScheduleForm } from "./create-schedule-form"

export default async function CreateSchedulePage() {
  const managers = await getEligibleBinManagersForSchedule()

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-2xl font-semibold">Create Power Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Pick which bin manager&apos;s Raspberry Pi this schedule should
            connect to, then set its power-on window.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/bin/schedule">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      {managers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Every bin manager already has their own power schedule.
        </p>
      ) : (
        <CreateScheduleForm managers={managers} />
      )}
    </div>
  )
}
