import { Suspense } from "react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TableSkeleton } from "@/components/TableSkeleton"
import { QuestHeader } from "./header"
import { QuestActions } from "./questActions"
import CreateQuestForm from "@/components/FormLogic/(Quest)/CreateQuestForm"
import { getQuests } from "@/app/action/quest"

const col_widths = ["20%", "12%", "10%", "12%", "12%", "12%", "12%", "10%"]
const materialTypes = ["PLASTIC", "METAL", "PAPER", "E_WASTE", "GENERAL"]

function parseSort(sort: string): { sortItem: string | undefined; sortOrder: string | undefined } {
  switch (sort) {
    case "titleAsc":
      return { sortItem: "title", sortOrder: "asc" }
    case "titleDesc":
      return { sortItem: "title", sortOrder: "desc" }
    case "rewardAsc":
      return { sortItem: "rewardPoints", sortOrder: "asc" }
    case "rewardDesc":
      return { sortItem: "rewardPoints", sortOrder: "desc" }
    case "dateAsc":
      return { sortItem: "createdAt", sortOrder: "asc" }
    case "dateDesc":
    default:
      return { sortItem: undefined, sortOrder: undefined }
  }
}

interface AllQuestsPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
    material?: string
  }>
}

export default async function AllQuestsPage({ searchParams }: AllQuestsPageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-full max-w-sm border-r overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Quest</CardTitle>
            <CardDescription>Create a new recycling quest for members.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQuestForm />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={8} />}>
          <QuestsTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function QuestsTable({ searchParams: params }: { searchParams: Awaited<AllQuestsPageProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = params.sort || "dateDesc"
  const currentSearch = params.search || ""
  const currentMaterials = params.material ? params.material.split(",") : [...materialTypes]

  const { sortItem, sortOrder } = parseSort(currentSort)

  const { quests, questCount } = await getQuests(
    currentPage,
    currentLimit,
    sortOrder,
    sortItem,
    currentSearch,
    currentMaterials
  )
  const totalPages = Math.max(1, Math.ceil(questCount / currentLimit))

  return (
    <>
      <QuestHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={questCount}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Material</TableHead>
            <TableHead className="text-center">Target</TableHead>
            <TableHead className="text-center">Reward Points</TableHead>
            <TableHead className="text-center">Start Date</TableHead>
            <TableHead className="text-center">End Date</TableHead>
            <TableHead className="text-center">Created At</TableHead>
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
            {quests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No quests found.
                </TableCell>
              </TableRow>
            ) : (
              quests.map((quest) => (
                <TableRow key={quest.id}>
                  <TableCell><span className="text-xs">{quest.title}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{quest.materialType}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{quest.target}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{quest.rewardPoints}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{quest.startDate ? new Date(quest.startDate).toLocaleDateString("en-SG") : "-"}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{quest.endDate ? new Date(quest.endDate).toLocaleDateString("en-SG") : "-"}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{new Date(quest.createdAt).toLocaleDateString("en-SG")}</span></TableCell>
                  <TableCell className="text-center"><QuestActions questId={quest.id} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
