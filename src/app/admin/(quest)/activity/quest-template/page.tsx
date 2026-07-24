import { Suspense } from "react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TableSkeleton } from "@/components/TableSkeleton"
import { QuestTemplateHeader } from "./header"
import { TemplateActions } from "./templateActions"
import CreateQuestTemplateForm from "@/components/FormLogic/(Quest)/CreateQuestTemplateForm"
import { getQuestTemplates, QuestTemplateSort } from "@/app/action/questTemplate"

const col_widths = ["25%", "15%", "10%", "15%", "15%", "10%"]
const materialTypes = ["PLASTIC", "METAL", "PAPER", "E_WASTE", "GENERAL"]

interface QuestTemplatePageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
    material?: string
  }>
}

export default async function QuestTemplatePage({ searchParams }: QuestTemplatePageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-full max-w-sm border-r overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Quest Template</CardTitle>
            <CardDescription>Create a reusable quest template.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQuestTemplateForm />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={6} />}>
          <QuestTemplateTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function QuestTemplateTable({ searchParams: params }: { searchParams: Awaited<QuestTemplatePageProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = (params.sort || "dateDesc") as QuestTemplateSort
  const currentSearch = params.search || ""
  const currentMaterials = params.material ? params.material.split(",") : [...materialTypes]

  const { templates, templateCount, totalPages } = await getQuestTemplates(
    currentPage,
    currentLimit,
    currentSort,
    currentSearch,
    currentMaterials
  )

  return (
    <>
      <QuestTemplateHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={templateCount}
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
            <TableHead className="text-center">Duration</TableHead>
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
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell><span className="text-xs">{t.title}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{t.materialType}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{t.target}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{t.rewardPoints}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{t.duration} days</span></TableCell>
                  <TableCell className="text-center"><TemplateActions templateId={t.id} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
