import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { StoreHeader } from "./header"
import { StoreActions } from "./storeActions"
import { getStoreAccounts } from "@/app/action/store"

const col_widths = ["18%", "22%", "10%", "12%", "16%", "12%", "10%"]
const storeFaculties = ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]

export default async function StoreAdminPage({
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
  const currentSort = params.sort || "dateDesc"
  const currentSearch = params.search || ""
  const currentFaculties = params.faculty ? params.faculty.split(",") : [...storeFaculties]

  const { stores, storeCount, totalPages } = await getStoreAccounts(
    currentPage,
    currentLimit,
    currentSort,
    currentSearch,
    currentFaculties
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StoreHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages}
        totalCount={storeCount}
      />

      <Table>
        <colgroup>
          {col_widths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Faculty</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-center">Last Active</TableHead>
            <TableHead className="text-center">Purchases</TableHead>
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
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No store accounts found.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell><span className="text-xs">{store.name}</span></TableCell>
                  <TableCell><span className="text-xs">{store.email}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{store.faculty ?? "N/A"}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{store.point?.balance ?? 0}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{store.point?.updatedAt ? new Date(store.point.updatedAt).toLocaleDateString("en-SG") : "N/A"}</span></TableCell>
                  <TableCell className="text-center"><span className="text-xs">{store._count?.transactions ?? 0}</span></TableCell>
                  <TableCell className="text-center"><StoreActions storeId={store.id} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
