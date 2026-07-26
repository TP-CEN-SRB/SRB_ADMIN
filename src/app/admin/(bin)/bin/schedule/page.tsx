import Link from "next/link"
import { Suspense } from "react"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPowerSchedule } from "@/app/action/bin"
import { ScheduleForm } from "@/components/FormLogic/(Misc)/ScheduleForm"
import { FormSkeleton } from "@/components/FormSkeleton"

const PowerSchedulePage = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Power Schedule</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/bin">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<FormSkeleton fields={3} />}>
          <ScheduleSection />
        </Suspense>
      </div>
    </div>
  )
}

async function ScheduleSection() {
  const schedule = await getPowerSchedule()

  return (
    <Card>
      <CardHeader>
        <CardTitle>System-wide Bin Power Schedule</CardTitle>
        <CardDescription>
          Set when bins&apos; power supplies should be switched on. Outside
          this window, every bin is powered off to save energy. This applies
          to all bins - they share one schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScheduleForm
          initialData={{
            enabled: schedule.enabled,
            startMinute: schedule.startMinute,
            endMinute: schedule.endMinute,
            days: schedule.days,
          }}
        />
      </CardContent>
    </Card>
  )
}

export default PowerSchedulePage
