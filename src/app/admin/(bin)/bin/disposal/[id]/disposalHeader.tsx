"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { ListFilter, ZoomIn, ZoomOut } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"
import DownloadImagesZip from "./download-images-zip"

const sorts = [
  { label: "Weight Asc", value: "weightAsc" },
  { label: "Weight Desc", value: "weightDesc" },
  { label: "Points Asc", value: "pointsAsc" },
  { label: "Points Desc", value: "pointsDesc" },
  { label: "Date Asc", value: "dateAsc" },
  { label: "Date Desc", value: "dateDesc" },
]

const ZOOM_LEVELS = [3, 5, 7]

interface DisposalHeaderProps {
  binId: string
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
  zoom: number
  material: string
  location: string
  imageCount: number
}

export function DisposalHeader({
  binId,
  currentPage,
  currentLimit,
  totalPages,
  totalCount,
  zoom,
  material,
  location,
  imageCount,
}: DisposalHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, setSort } =
    useTableQueryParams({ currentPage, totalPages })
  const router = useRouter()
  const pathname = usePathname()

  const currentSort = searchParams.get("sort") || "dateDesc"

  function onCheckedSort(sortValue: string, isChecked: boolean) {
    setSort(sortValue, isChecked)
  }

  function onZoom(direction: "in" | "out") {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom)
    const nextIndex =
      direction === "in"
        ? Math.max(0, currentIndex - 1)
        : Math.min(ZOOM_LEVELS.length - 1, currentIndex + 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set("zoom", String(ZOOM_LEVELS[nextIndex]))
    router.push(`${pathname}?${params.toString()}`)
  }

  const zoomIndex = ZOOM_LEVELS.indexOf(zoom)

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm truncate">
          {material} @ {location}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {sorts.map(function (sort) {
                return (
                  <DropdownMenuCheckboxItem
                    key={sort.value}
                    checked={currentSort === sort.value}
                    onCheckedChange={function (checked) { onCheckedSort(sort.value, checked) }}
                  >
                    {sort.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={zoomIndex === 0}
            onClick={() => onZoom("in")}
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            onClick={() => onZoom("out")}
          >
            <ZoomOut className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DownloadImagesZip binId={binId} imageCount={imageCount} />
        <TablePaginationControls
          currentPage={currentPage}
          currentLimit={currentLimit}
          totalPages={totalPages}
          totalCount={totalCount}
          isPending={isPending}
          onLimitChange={setLimit}
          onPageChange={goToPage}
        />
      </div>
    </header>
  )
}
