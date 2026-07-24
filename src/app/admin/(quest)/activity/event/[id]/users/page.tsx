import { Suspense } from "react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { EventUserHeader } from "./header"
import { getUsersByEventId } from "@/app/action/event"

const col_widths = ["26%", "30%", "14%", "30%"]

interface EventUsersPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    faculty?: string
  }>
}

export default async function ViewEventUsersPage({ params, searchParams }: EventUsersPageProps) {
  const { id } = await params
  const sp = await searchParams

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton columns={4} />}>
        <EventUsersTable id={id} searchParams={sp} />
      </Suspense>
    </div>
  )
}

async function EventUsersTable({ id, searchParams: sp }: { id: string; searchParams: Awaited<EventUsersPageProps["searchParams"]> }) {
  const currentPage = Number(sp.page) || 1
  const currentLimit = Number(sp.limit) || 20
  const currentSearch = sp.search || ""
  const currentFaculties = sp.faculty ? sp.faculty.split(",") : ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]

  const { usersInEvent, userCount, totalPages } = await getUsersByEventId(
    id,
    currentPage,
    currentLimit,
    currentSearch,
    currentFaculties
  )

  return (
    <>
      <EventUserHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={userCount}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Faculty</TableHead>
            <TableHead className="text-center">Points</TableHead>
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
            {usersInEvent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No matching users found.
                </TableCell>
              </TableRow>
            ) : (
              usersInEvent.map((entry) => (
                <TableRow key={entry.user.id}>
                  <TableCell><span className="text-xs">{entry.user.name ?? "Unnamed User"}</span></TableCell>
                  <TableCell><span className="text-xs">{entry.user.email}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{entry.user.faculty}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{entry.points}</span></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
