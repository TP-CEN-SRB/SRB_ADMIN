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
import { getEventById } from "@/app/action/event"
import UpdateEventForm from "@/components/FormLogic/EventForms/UpdateEventForm"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

const UpdateEventPage = ({
  params,
}: {
  params: Promise<{ eventId: string }>
}) => {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Event</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/activity/event">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<FormSkeleton fields={4} />}>
          <UpdateEventSection params={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function UpdateEventSection({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const event = await getEventById(eventId)

  if (!event) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Update the event&apos;s information.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateEventForm initialData={{ ...event, id: eventId }} />
      </CardContent>
    </Card>
  )
}

export default UpdateEventPage
