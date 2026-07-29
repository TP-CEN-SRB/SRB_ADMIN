import Link from "next/link"
import { notFound } from "next/navigation"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPowerScheduleById } from "@/app/action/bin"
import { ScheduleForm } from "@/components/FormLogic/(Misc)/ScheduleForm"

interface EditSchedulePageProps {
  params: Promise<{ id: string }>
}

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  const { id } = await params
  const schedule = await getPowerScheduleById(id)

  if (!schedule) {
    notFound()
  }

  const label = schedule.user ? `${schedule.user.name} (${schedule.user.location ?? "no location"})` : "Global Default"

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Power Schedule</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/bin/schedule">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{label}</CardTitle>
            <CardDescription>
              Set when this bin&apos;s power supply should be switched on.
              Outside this window, the bin is powered off to save energy.
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
              userId={schedule.userId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
