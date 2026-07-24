import { Suspense } from "react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { MemberTransactionHeader } from "./header"
import { getTransactionByUserId } from "@/app/action/transaction"

const col_widths = ["16%", "16%", "16%", "12%", "40%"]

function formatTimestamp(date: Date | string) {
  return new Date(date).toLocaleString("en-SG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

interface MemberTransactionPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    limit?: string
    sortOrder?: string
    transactionType?: string
  }>
}

export default async function MemberTransactionPage({ params, searchParams }: MemberTransactionPageProps) {
  const { id } = await params
  const sp = await searchParams

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton columns={5} />}>
        <MemberTransactionTable id={id} searchParams={sp} />
      </Suspense>
    </div>
  )
}

async function MemberTransactionTable({
  id,
  searchParams: sp,
}: {
  id: string
  searchParams: Awaited<MemberTransactionPageProps["searchParams"]>
}) {
  const currentPage = Number(sp.page) || 1
  const currentLimit = Number(sp.limit) || 10
  const sortOrder = sp.sortOrder
  const transactionType = sp.transactionType ? decodeURIComponent(sp.transactionType) : null

  const { transactionCount, transactions, user, totalPages } = await getTransactionByUserId(
    id,
    currentPage,
    sortOrder,
    transactionType,
    currentLimit
  )

  return (
    <>
      <MemberTransactionHeader
        memberId={id}
        memberName={user?.name ?? "Member"}
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages ?? 1}
        totalCount={transactionCount ?? 0}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Weight</TableHead>
            <TableHead className="text-center">CO2 Saved</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table className="table-fixed">
          <colgroup>
            {col_widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <TableBody>
            {!transactions || transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-center"><span className="text-xs">{transaction.transactionType}</span></TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {transaction.weightInGrams != null ? `${transaction.weightInGrams}g` : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {transaction.carbonSaved != null ? `${transaction.carbonSaved.toFixed(2)}g` : "—"}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-center text-xs font-medium ${
                      transaction.pointsChange > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.pointsChange > 0 ? "+" : ""}
                    {transaction.pointsChange}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">{formatTimestamp(transaction.createdAt)}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
