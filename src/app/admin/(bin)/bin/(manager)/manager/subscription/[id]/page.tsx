import { Suspense } from "react"
import { getSubscriptionByUserId } from "@/app/action/subscription"
import { TableSkeleton } from "@/components/TableSkeleton"
import { columns } from "../columns"
import { DataTable } from "../data-table"

export default async function ViewSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Suspense fallback={<TableSkeleton columns={2} showHeader={false} />}>
        <SubscriptionTable id={id} />
      </Suspense>
    </div>
  )
}

async function SubscriptionTable({ id }: { id: string }) {
  const { subscriptions } = await getSubscriptionByUserId(id)
  return (
    <DataTable
      columns={columns}
      data={subscriptions === undefined ? [] : subscriptions}
    />
  )
}

