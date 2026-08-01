import { Suspense } from "react"
import { AlertTriangle, DoorOpen } from "lucide-react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { LogHeader } from "./header"
import { LogMessage } from "./log-message"
import { getLogs, getLogBins } from "@/app/action/log"

const col_widths = ["55%", "20%", "25%"]

interface LogAdminPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    source?: string
    bin?: string
  }>
}

export default async function LogAdminPage({ searchParams }: LogAdminPageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={3} />}>
        <LogTable searchParams={params} />
      </Suspense>
    </div>
  )
}

async function LogTable({ searchParams: params }: { searchParams: Awaited<LogAdminPageProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 20
  const currentSearch = params.search || ""
  const currentSource = params.source ? params.source.split(",") : ["BIN_COMMAND", "APP_ERROR"]
  // Absent = every bin, so the filter starts unrestricted rather than empty.
  const currentBins = params.bin ? params.bin.split(",") : []

  const [{ logs, logCount, totalPages }, binOptions] = await Promise.all([
    getLogs(currentPage, currentLimit, currentSearch, currentSource, currentBins),
    getLogBins(),
  ])

  const binLabels = new Map(binOptions.map(function (bin) { return [bin.value, bin.label] }))

  return (
    <>
      <LogHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={logCount}
        binOptions={binOptions}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead className="text-center">Bin</TableHead>
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
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  💤 No activity logged yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {log.source === "BIN_COMMAND" ? (
                        <DoorOpen className="text-blue-500 w-4 h-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
                      )}
                      <LogMessage message={log.message} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs text-muted-foreground">
                      {log.binId ? binLabels.get(log.binId) || log.binId.slice(0, 8) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {/* timeZone is required, not optional: "en-SG" only picks
                          the formatting conventions, and this renders in a
                          server component - on Vercel that means UTC, which
                          showed every timestamp 8 hours behind SGT. */}
                      {log.createdAt.toLocaleString("en-SG", {
                        timeZone: "Asia/Singapore",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
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
