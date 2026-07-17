import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { BinManagerHeader } from "./header"
import { BinManagerActions } from "./binManagerActions"
import { listOfBinManagersUsed } from "./action"

const col_widths = ["25%", "30%", "15%", "15%", "15%"]
const binManagerFaculties = ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]

export default async function AllBinManagersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    limit?: string
    sort?: string
    search?: string
    faculty?: string
  }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const currentLimit = Number(params.limit) || 10
  const currentSort = params.sort || "nameAsc"
  const currentSearch = params.search || ""
  const currentFaculties = params.faculty ? params.faculty.split(",") : [...binManagerFaculties]

  const { binManagers, binManagerCount, totalPages } = await listOfBinManagersUsed(
    currentPage,
    currentLimit,
    currentSort,
    currentSearch,
    currentFaculties
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BinManagerHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={binManagerCount}
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
            <TableHead className="text-center">Bins</TableHead>
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
            {binManagers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No bin managers found.
                </TableCell>
              </TableRow>
            ) : (
              binManagers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell><span className="text-xs">{manager.name}</span></TableCell>
                  <TableCell><span className="text-xs">{manager.email}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{manager.faculty}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{manager._count.bins}</span></TableCell>
                  <TableCell className="text-center">
                    <BinManagerActions binManagerId={manager.id} binCount={manager._count.bins} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
