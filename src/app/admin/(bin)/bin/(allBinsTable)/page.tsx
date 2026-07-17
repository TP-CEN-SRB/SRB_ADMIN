import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { BinHeader } from "./header"
import { BinActions } from "./binActions"
import { getAllBinsWithUserAndMaterial } from "@/app/action/bin"
import { getBinMaterials } from "@/app/action/binMaterial"

const col_widths = ["18%", "18%", "13%", "13%", "11%", "17%", "10%"]
const statuses = ["FUNCTIONAL", "UNDER_MAINTENANCE"]

export default async function AllBinsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
    status?: string
    material?: string
  }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = params.sort || "dateDesc"
  const currentSearch = params.search || ""
  const currentStatuses = params.status ? params.status.split(",") : statuses

  const materials = await getBinMaterials()
  const currentMaterials = params.material ? params.material.split(",") : materials.map((m) => m.name)

  const { bins, binCount, totalPages } = await getAllBinsWithUserAndMaterial(
    currentPage,
    currentLimit,
    currentSort,
    currentSearch,
    currentStatuses,
    currentMaterials
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BinHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={binCount}
        materials={materials}
        exportData={bins}
      />

      <Table>
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-center">Material</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Capacity</TableHead>
            <TableHead className="text-center">Disposals</TableHead>
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
            {bins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No bins found.
                </TableCell>
              </TableRow>
            ) : (
              bins.map((bin) => {
                const capacityColor =
                  bin.currentCapacity > 85
                    ? "text-red-500"
                    : bin.currentCapacity > 60
                    ? "text-yellow-500"
                    : "text-green-500"
                return (
                  <TableRow key={bin.id}>
                    <TableCell><span className="text-xs">{bin.user.name}</span></TableCell>
                    <TableCell><span className="text-xs">{bin.user.location}</span></TableCell>
                    <TableCell className="text-center"><span className="text-xs">{bin.binMaterial.name}</span></TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs">{bin.status === "FUNCTIONAL" ? "Functional" : "Under Maintenance"}</span>
                    </TableCell>
                    <TableCell className={`text-center text-xs ${capacityColor}`}>{bin.currentCapacity}%</TableCell>
                    <TableCell className="text-center"><span className="text-xs">{bin._count.disposals}</span></TableCell>
                    <TableCell className="text-center"><BinActions bin={bin} /></TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
