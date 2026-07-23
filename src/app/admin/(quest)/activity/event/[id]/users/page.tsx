import { Suspense } from "react"
import { getUsersByEventId } from "@/app/action/event"
import { TableSkeleton } from "@/components/TableSkeleton"
import ClientEventUserTable from "./eventUserTable"

const ViewEventUsersPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return (
    <div className="flex flex-col h-full overflow-hidden p-6">
      <h1 className="text-xl font-semibold mb-4">Users in Event</h1>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<TableSkeleton columns={4} showHeader={false} />}>
          <EventUsersTable id={id} />
        </Suspense>
      </div>
    </div>
  )
}

async function EventUsersTable({ id }: { id: string }) {
  const usersInEvent = await getUsersByEventId(id)
  return <ClientEventUserTable usersInEvent={usersInEvent} />
}

export default ViewEventUsersPage
