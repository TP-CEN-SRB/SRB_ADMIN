import { Suspense } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ImageIcon, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/TableSkeleton"
import { TransactionHeader } from "./header"
import { DashboardPeriodToggle } from "@/app/admin/periodToggle"
import { getAllTransactions, getTransactionStats } from "@/app/action/transaction"
import { DateRange } from "@/utils/dateUtils"

const col_widths = ["16%", "16%", "12%", "10%", "22%", "14%", "10%"]

type Period = "day" | "week" | "month" | "year"
const periods: Period[] = ["day", "week", "month", "year"]

function formatPeriodLabel(period: Period, offset: number, startDate?: Date, endDate?: Date) {
  if (offset === 0) {
    return period === "day" ? "today" : period === "week" ? "this week" : period === "month" ? "this month" : "this year"
  }
  if (!startDate || !endDate) return ""
  switch (period) {
    case "day":
      return format(startDate, "d MMM yyyy")
    case "week":
      return `${format(startDate, "d/M")} - ${format(endDate, "d/M")}`
    case "month":
      return format(startDate, "MMMM yyyy")
    case "year":
      return format(startDate, "yyyy")
  }
}

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

function StatCard({
  icon: Icon,
  iconClassName,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
  value: string | number
  label: string
}) {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-2 ${iconClassName}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TransactionAdminPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
    transactionType?: string
    period?: string
    offset?: string
  }>
}

export default async function TransactionAdminPage({ searchParams }: TransactionAdminPageProps) {
  const params = await searchParams
  const period = (periods.includes(params.period as Period) ? params.period : "week") as Period
  const offset = Math.min(0, Number(params.offset) || 0)
  const { startDate, endDate } = DateRange(period, offset)
  const resolvedLabel = formatPeriodLabel(period, offset, startDate, endDate)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-col gap-4 p-4 pb-0">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <p className="text-sm text-muted-foreground">Points economy overview</p>
          </div>
          <DashboardPeriodToggle period={period} offset={offset} rangeLabel={resolvedLabel} />
        </div>

        <Suspense key={`stats:${period}:${offset}`} fallback={<TransactionStatsSkeleton />}>
          <TransactionStats startDate={startDate} endDate={endDate} resolvedLabel={resolvedLabel} />
        </Suspense>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col mt-4">
        <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={7} />}>
          <TransactionTable searchParams={params} startDate={startDate} endDate={endDate} />
        </Suspense>
      </div>
    </div>
  )
}

function TransactionStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function TransactionStats({
  startDate,
  endDate,
  resolvedLabel,
}: {
  startDate?: Date
  endDate?: Date
  resolvedLabel: string
}) {
  const stats = await getTransactionStats(startDate, endDate)

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={Wallet}
        iconClassName="bg-blue-500/10 text-blue-600"
        value={stats.pointsInCirculation.toLocaleString()}
        label="Points in Circulation"
      />
      <StatCard
        icon={TrendingUp}
        iconClassName="bg-green-500/10 text-green-600"
        value={`+${stats.totalEarned.toLocaleString()}`}
        label={`Earned (${resolvedLabel})`}
      />
      <StatCard
        icon={TrendingDown}
        iconClassName="bg-red-500/10 text-red-600"
        value={`-${stats.totalSpent.toLocaleString()}`}
        label={`Spent (${resolvedLabel})`}
      />
    </div>
  )
}

async function TransactionTable({
  searchParams: params,
  startDate,
  endDate,
}: {
  searchParams: Awaited<TransactionAdminPageProps["searchParams"]>
  startDate?: Date
  endDate?: Date
}) {
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
    currentSearch,
    startDate,
    endDate
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
            <TableHead className="text-center">Actions</TableHead>
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
                    <span className="text-xs">{formatTimestamp(transaction.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.transactionType === "DISPOSAL" && transaction.queueId ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/transaction/disposal/${transaction.queueId}`}>
                          <ImageIcon className="mr-1 size-3.5" />
                          More
                        </Link>
                      </Button>
                    ) : null}
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
