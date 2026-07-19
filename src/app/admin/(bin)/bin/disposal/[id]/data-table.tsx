"use client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import SortByFilter from "./sortBy"
import ExportCSV from "./export-csv"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  count: number
  binId: string
  material: string
  location: string
}

function capitalizeFirstLetter(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function DataTable<TData, TValue>({
  binId,
  count,
  columns,
  data,
  material,
  location,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const searchParams = useSearchParams()
  const path = usePathname()
  // Because of the '|| 1' fallback, 'page' is guaranteed to be a number >= 1
  const page = Number(searchParams.get("page")) || 1
  const router = useRouter()

  const maxPage = Math.max(Math.ceil(count / 10), 1)

  const handlePreviousClick = function(){
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set("page", String(page - 1))
      router.push(`${path}?${params.toString()}`)
    }
  }

  const handleNextClick = function(){
    const params = new URLSearchParams(searchParams)
    if (page < maxPage) {
      params.set("page", String(page + 1))
      router.push(`${path}?${params.toString()}`)
    }
  }

  const handleApplySortBy = (sortItem: string, sortOrder: string) => {
    const params = new URLSearchParams(searchParams)
    if (sortItem && sortOrder) {
      params.set("sortItem", sortItem)
      params.set("sortOrder", sortOrder)
    } else {
      params.delete("sortItem")
      params.delete("sortOrder")
    }
    router.replace(`${path}?${params.toString()}`)
  }

  const handleResetSortBy = function(){
    const params = new URLSearchParams(searchParams)
    params.delete("sortItem")
    params.delete("sortOrder")
    router.replace(`${path}?${params.toString()}`)
  }

  return (
    <div className="px-4 text-foreground overflow-auto">
      {/* Made the header responsive so it stacks on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
        {/* Changed text-slate-800 to text-foreground for dark mode compatibility */}
        <h2 className="text-foreground line-clamp-1 flex-1 font-medium text-lg">
          <span className="font-normal text-muted-foreground">Showing results for: </span>
          {capitalizeFirstLetter(material.toLowerCase())} bin @ {location}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <SortByFilter
            onResetSortBy={handleResetSortBy}
            onApplySortBy={handleApplySortBy}
          />
          <ExportCSV data={data} binId={binId} />
        </div>
      </div>
      
      <div className="rounded-md border border-border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="py-4 flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {maxPage}
          </p>
          <div className="flex space-x-2">
            <Button
              disabled={page <= 1}
              onClick={handlePreviousClick}
              variant="outline"
              size="sm"
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= maxPage}
              onClick={handleNextClick}
            >
              {">"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}