import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { EventHeader } from "./header"
import { EventActions } from "./eventActions"
import { getEvents } from "@/app/action/event"

const col_widths = ["20%", "30%", "13%", "13%", "14%", "10%"]

function parseSort(sort: string): { sortItem: string | undefined; sortOrder: string | undefined } {
  switch (sort) {
    case "titleAsc":
      return { sortItem: "title", sortOrder: "asc" }
    case "titleDesc":
      return { sortItem: "title", sortOrder: "desc" }
    case "startAsc":
      return { sortItem: "startDate", sortOrder: "asc" }
    case "startDesc":
      return { sortItem: "startDate", sortOrder: "desc" }
    case "dateAsc":
      return { sortItem: "createdAt", sortOrder: "asc" }
    case "dateDesc":
    default:
      return { sortItem: undefined, sortOrder: undefined }
  }
}

export default async function AllEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
  }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = params.sort || "dateDesc"
  const currentSearch = params.search || ""

  const { sortItem, sortOrder } = parseSort(currentSort)

  const { events, eventCount } = await getEvents(currentPage, currentLimit, sortOrder, sortItem, currentSearch)
  const totalPages = Math.max(1, Math.ceil(eventCount / currentLimit))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <EventHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={eventCount}
      />

      <Table>
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Start Date</TableHead>
            <TableHead className="text-center">End Date</TableHead>
            <TableHead className="text-center">Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className="flex-1 overflow-auto">
        <Table>
          <colgroup>
            {col_widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No events found.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell><span className="text-xs">{event.title}</span></TableCell>
                  <TableCell><span className="text-xs line-clamp-1">{event.description}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{new Date(event.startDate).toLocaleDateString("en-SG")}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{new Date(event.endDate).toLocaleDateString("en-SG")}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{new Date(event.createdAt).toLocaleDateString("en-SG")}</span></TableCell>
                  <TableCell className="text-center"><EventActions eventId={event.id} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
