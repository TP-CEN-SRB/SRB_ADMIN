import { Suspense } from "react"
import { getUsersByQuestId } from "@/app/action/quest"
import { TableSkeleton } from "@/components/TableSkeleton"
import ClientQuestUserTable from "./questUserTable"

const ViewQuestUsersPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return (
    <div className="flex flex-col h-full overflow-hidden p-6">
      <h1 className="text-xl font-semibold mb-4">Users in Quest</h1>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<TableSkeleton columns={4} showHeader={false} />}>
          <QuestUsersTable id={id} />
        </Suspense>
      </div>
    </div>
  )
}

async function QuestUsersTable({ id }: { id: string }) {
  const usersInQuest = await getUsersByQuestId(id)
  return <ClientQuestUserTable usersInQuest={usersInQuest} />
}

export default ViewQuestUsersPage
