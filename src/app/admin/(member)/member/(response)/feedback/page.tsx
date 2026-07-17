import { Star } from "lucide-react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FeedbackHeader } from "./header"
import { FeedbackActions } from "./feedbackActions"
import { FaultReportActions } from "./faultReportActions"
import { getFeedbacks, getFaultReports } from "@/app/action/feedback"

const feedbackColWidths = ["20%", "12%", "15%", "33%", "12%", "8%"]
const reportColWidths = ["17%", "13%", "15%", "12%", "28%", "15%"]

const statusStyles: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
      ))}
    </div>
  )
}

export default async function FeedbackAndReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; search?: string; status?: string }>
}) {
  const params = await searchParams
  const view = params.view === "reports" ? "reports" : "feedback"
  const search = params.search || ""
  const status = params.status || "ALL"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FeedbackHeader view={view} />

      {view === "feedback" ? (
        <FeedbackTable search={search} />
      ) : (
        <FaultReportsTable search={search} status={status} />
      )}
    </div>
  )
}

async function FeedbackTable({ search }: { search: string }) {
  const feedbacks = await getFeedbacks(search)

  return (
    <>
      <Table className="table-fixed">
        <colgroup>
          {feedbackColWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table className="table-fixed">
          <colgroup>
            {feedbackColWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No feedback found.
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell><span className="text-xs">{feedback.user.name}</span></TableCell>
                  <TableCell><span className="text-xs">{feedback.user.email}</span></TableCell>
                  <TableCell className="text-center"><div className="flex justify-center"><StarRating rating={feedback.rating} /></div></TableCell>
                  <TableCell><span className="text-xs truncate block max-w-full">{feedback.message || "—"}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{new Date(feedback.createdAt).toLocaleDateString("en-SG")}</span></TableCell>
                  <TableCell className="text-center"><FeedbackActions id={feedback.id} message={feedback.message} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

async function FaultReportsTable({ search, status }: { search: string; status: string }) {
  const reports = await getFaultReports(search, status)

  return (
    <>
      <Table className="table-fixed">
        <colgroup>
          {reportColWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead>Handled By</TableHead>
            <TableHead className="text-center">Status / Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table className="table-fixed">
          <colgroup>
            {reportColWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No fault reports found.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const taken =
                  report.takenByTelegramName ||
                  report.takenByAdminName ||
                  (report.status !== "OPEN" ? "Admin Dashboard" : null)
                const resolved =
                  report.resolvedByTelegramName ||
                  report.resolvedByAdminName ||
                  (report.status === "RESOLVED" ? "Admin Dashboard" : null)

                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <span className="text-xs">{report.user.name}</span>
                      <div className="text-xs text-muted-foreground">{report.user.email}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">{report.category}</Badge>
                    </TableCell>
                    <TableCell><span className="text-xs truncate block max-w-full">{report.location}</span></TableCell>
                    <TableCell className="text-center"><span className="text-xs">{new Date(report.createdAt).toLocaleDateString("en-SG")}</span></TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {taken && <p>Taken: {taken}</p>}
                        {resolved && <p>Resolved: {resolved}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={statusStyles[report.status]}>{report.status.replace("_", " ")}</Badge>
                        <FaultReportActions
                          id={report.id}
                          status={report.status}
                          description={report.description}
                          faultImageUrl={report.faultimageUrl}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
