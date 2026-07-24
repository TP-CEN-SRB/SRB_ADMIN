import { Suspense } from "react"
import { AlertTriangle, DoorOpen } from "lucide-react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { LogHeader } from "./header"
import { getLogs } from "@/app/action/log"

const col_widths = ["70%", "30%"]

interface LogAdminPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    source?: string
  }>
}

export default async function LogAdminPage({ searchParams }: LogAdminPageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={2} />}>
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

  const { logs, logCount, totalPages } = await getLogs(currentPage, currentLimit, currentSearch, currentSource)

  return (
    <>
      <LogHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={logCount}
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
                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
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
                      <span className="text-xs whitespace-pre-wrap wrap-break-word">{log.message}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {log.createdAt.toLocaleString("en-SG", {
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
