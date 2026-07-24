import { Suspense } from "react"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TableSkeleton } from "@/components/TableSkeleton"
import { MaterialHeader } from "./header"
import { MaterialActions } from "./materialActions"
import CreateBinMaterialForm from "./CreateBinMaterialForm"
import { getAllMaterials } from "./action"
import { listOfBinMaterialInUse } from "./action"

const col_widths = ["35%", "20%", "25%", "20%"]

interface AllBinMaterialsPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
  }>
}

export default async function AllBinMaterialsPage({ searchParams }: AllBinMaterialsPageProps) {
  const params = await searchParams

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-full max-w-sm border-r overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Material</CardTitle>
            <CardDescription>
              Add a new recyclable material type and its point multiplier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateBinMaterialForm />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton columns={4} />}>
          <MaterialsTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function MaterialsTable({ searchParams: params }: { searchParams: Awaited<AllBinMaterialsPageProps["searchParams"]> }) {
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = params.sort || "nameAsc"
  const currentSearch = params.search || ""

  const [{ materials, materialCount, totalPages }, materialsInUse] = await Promise.all([
    getAllMaterials(currentPage, currentLimit, currentSort, currentSearch),
    listOfBinMaterialInUse(),
  ])

  const materialsInUseNames = new Set(materialsInUse.map((m) => m.name))

  return (
    <>
      <MaterialHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={materialCount}
      />

      <Table className="table-fixed">
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead className="text-center">Multiplier</TableHead>
            <TableHead className="text-center">Carbon Multiplier</TableHead>
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
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No materials found.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell><span className="text-xs">{material.name}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{material.multiplier}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{material.carbon_multiplier}</span></TableCell>
                  <TableCell className="text-center">
                    <MaterialActions
                      materialId={material.id}
                      hasBins={materialsInUseNames.has(material.name)}
                    />
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
