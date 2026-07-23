import { Suspense } from "react"
import { getTransactionByUserId } from "@/app/action/transaction"
import { columns } from "@/components/Table/Transaction/columns"
import { DataTable } from "@/components/Table/Transaction/data-table"
import { TableSkeleton } from "@/components/TableSkeleton"

const ViewStudentTransactionPage = async ({
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
        fallback={<TableSkeleton columns={5} showHeader={false} />}
      >
        <TransactionTable id={id} page={page} sortOrder={sortOrder} transactionType={transactionType} />
      </Suspense>
    </div>
  )
}

async function TransactionTable({
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
    <DataTable
      name={user?.name as string}
      userId={id}
      columns={columns}
      data={transactions === undefined ? [] : transactions}
      count={transactionCount === undefined ? 0 : transactionCount}
    />
  )
}

export default ViewStudentTransactionPage
