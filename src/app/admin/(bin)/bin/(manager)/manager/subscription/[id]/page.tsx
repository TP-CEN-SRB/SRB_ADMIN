import { getSubscriptionByUserId } from "@/app/action/subscription"
import { columns } from "../columns"
import { DataTable } from "../data-table"

export default async function ViewSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
  const { subscriptions } = await getSubscriptionByUserId(id)
  return (
    <DataTable
      columns={columns}
      data={subscriptions === undefined ? [] : subscriptions}
    />
  )
}

