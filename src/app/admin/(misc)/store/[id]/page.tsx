import { Suspense } from "react"
import { getTransactionByUserId } from "@/app/action/transaction"
import { columns } from "@/components/Table/Transaction/columns"
import { DataTable } from "@/components/Table/Transaction/data-table"
import { TableSkeleton } from "@/components/TableSkeleton"

const ViewStoreTransactionPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: { [key: string]: string }
}) => {
  const { id } = await params
  const page = Number(searchParams?.page) || 1
  const sortOrder = searchParams.sortOrder
  const transactionType = searchParams.transactionType
    ? decodeURIComponent(searchParams.transactionType)
    : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Suspense
        key={`${page}:${sortOrder}:${transactionType}`}
        fallback={<TableSkeleton columns={5} />}
      >
        <StoreTransactionTable id={id} page={page} sortOrder={sortOrder} transactionType={transactionType} />
      </Suspense>
    </div>
  )
}

async function StoreTransactionTable({
  id,
  page,
  sortOrder,
  transactionType,
}: {
  id: string
  page: number
  sortOrder: string | undefined
  transactionType: string | null
}) {
  const { transactionCount, transactions, user } = await getTransactionByUserId(
    id,
    page,
    sortOrder,
    transactionType
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h1 className="text-xl font-semibold mb-4 px-4 pt-4">
        Transaction History for {user?.name}
      </h1>
      <div className="flex-1 overflow-hidden">
        <DataTable
          name={user?.name as string}
          userId={id}
          columns={columns}
          data={transactions ?? []}
          count={transactionCount ?? 0}
        />
      </div>
    </div>
  )
}

export default ViewStoreTransactionPage
