import { getTransactionByUserId } from "@/app/action/transaction"
import { columns } from "@/components/Table/Transaction/columns"
import { DataTable } from "@/components/Table/Transaction/data-table"


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

  const { transactionCount, transactions, user } = await getTransactionByUserId(
    id,
    page,
    sortOrder,
    transactionType
  )

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        Transaction History for {user?.name}
      </h1>
      <DataTable
        name={user?.name as string}
        userId={id}
        columns={columns}
        data={transactions ?? []}
        count={transactionCount ?? 0}
      />
    </div>
  )
}

export default ViewStoreTransactionPage
