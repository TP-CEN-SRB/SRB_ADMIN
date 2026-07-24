import { Suspense } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/TableSkeleton"
import { QuestUserHeader } from "./header"
import { getUsersByQuestId } from "@/app/action/quest"

const col_widths = ["22%", "26%", "12%", "28%", "12%"]

interface QuestUsersPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    faculty?: string
    completion?: string
  }>
}

export default async function ViewQuestUsersPage({ params, searchParams }: QuestUsersPageProps) {
  const { id } = await params
  const sp = await searchParams

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton columns={5} />}>
        <QuestUsersTable id={id} searchParams={sp} />
      </Suspense>
    </div>
  )
}

async function QuestUsersTable({ id, searchParams: sp }: { id: string; searchParams: Awaited<QuestUsersPageProps["searchParams"]> }) {
  const currentPage = Number(sp.page) || 1
  const currentLimit = Number(sp.limit) || 20
  const currentSearch = sp.search || ""
  const currentFaculties = sp.faculty ? sp.faculty.split(",") : ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]
  const currentCompletion = sp.completion ? sp.completion.split(",") : ["Completed", "Not Completed"]

  const { usersInQuest, userCount, totalPages } = await getUsersByQuestId(
    id,
    currentPage,
    currentLimit,
    currentSearch,
    currentFaculties,
    currentCompletion
  )

  return (
    <>
      <QuestUserHeader
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
            <TableHead>Progress</TableHead>
            <TableHead className="text-center">Completed</TableHead>
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
            {usersInQuest.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No matching users found.
                </TableCell>
              </TableRow>
            ) : (
              usersInQuest.map(({ user, progress, isCompleted }) => (
                <TableRow key={user.id}>
                  <TableCell><span className="text-xs">{user.name}</span></TableCell>
                  <TableCell><span className="text-xs">{user.email}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{user.faculty}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-9 text-right">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {isCompleted ? (
                      <CheckCircle className="text-green-600 inline-block size-4" />
                    ) : (
                      <XCircle className="text-muted-foreground inline-block size-4" />
                    )}
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
