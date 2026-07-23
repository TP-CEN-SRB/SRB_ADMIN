import { Suspense } from "react"
import Link from "next/link"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { TransactionHeader } from "./header"
import { getAllTransactions } from "@/app/action/transaction"

const col_widths = ["20%", "18%", "14%", "12%", "24%", "12%"]

interface TransactionAdminPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
    transactionType?: string
  }>
}

export default async function TransactionAdminPage({ searchParams }: TransactionAdminPageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={6} />}>
        <TransactionTable searchParams={params} />
      </Suspense>
    </div>
  )
}

async function TransactionTable({ searchParams: params }: { searchParams: Awaited<TransactionAdminPageProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 20
  const currentSort = params.sort || "dateDesc"
  const currentSearch = params.search || ""
  const currentType = params.transactionType ? decodeURIComponent(params.transactionType) : null

  const { transactions, transactionCount, totalPages } = await getAllTransactions(
    currentPage,
    currentLimit,
    currentSort === "dateAsc" ? "asc" : "desc",
    currentType,
    currentSearch
  )

  return (
    <>
      <TransactionHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={transactionCount}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead>Description</TableHead>
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
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Link
                      href={`/admin/member/transaction/${transaction.user.id}`}
                      className="text-xs font-medium hover:underline"
                    >
                      {transaction.user.name ?? "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell><span className="text-xs">{transaction.user.email}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{transaction.transactionType}</span></TableCell>
                  <TableCell
                    className={`text-center text-xs font-medium ${
                      transaction.pointsChange > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.pointsChange > 0 ? "+" : ""}
                    {transaction.pointsChange}
                  </TableCell>
                  <TableCell><span className="text-xs">{transaction.description}</span></TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {new Date(transaction.createdAt).toLocaleString("en-SG", { hour12: false })}
                    </span>
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
