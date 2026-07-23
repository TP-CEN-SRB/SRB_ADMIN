"use client"
import { useState } from "react"
import Image from "next/image"
import { ImageOff, ZoomIn, ZoomOut } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import SortByFilter from "./sortBy"
import ExportCSV from "./export-csv"
import { Disposal } from "@/app/action/disposal"

const PAGE_SIZE = 21
const ZOOM_LEVELS = [3, 5, 7] as const

interface DisposalGalleryProps {
  data: Disposal[]
  count: number
  binId: string
  material: string
  location: string
}

function capitalizeFirstLetter(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const gridColsClass: Record<(typeof ZOOM_LEVELS)[number], string> = {
  3: "grid-cols-2 sm:grid-cols-3",
  5: "grid-cols-3 sm:grid-cols-5",
  7: "grid-cols-4 sm:grid-cols-7",
}

export function DisposalGallery({ data, count, binId, material, location }: DisposalGalleryProps) {
  const [zoomIndex, setZoomIndex] = useState(0)
  const columns = ZOOM_LEVELS[zoomIndex]

  const searchParams = useSearchParams()
  const path = usePathname()
  const page = Number(searchParams.get("page")) || 1
  const router = useRouter()

  const maxPage = Math.max(Math.ceil(count / PAGE_SIZE), 1)

  const handlePreviousClick = function () {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set("page", String(page - 1))
      router.push(`${path}?${params.toString()}`)
    }
  }

  const handleNextClick = function () {
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

  const handleResetSortBy = function () {
    const params = new URLSearchParams(searchParams)
    params.delete("sortItem")
    params.delete("sortOrder")
    router.replace(`${path}?${params.toString()}`)
  }

  return (
    <div className="px-4 text-foreground overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
        <h2 className="text-foreground line-clamp-1 flex-1 font-medium text-lg">
          <span className="font-normal text-muted-foreground">Showing results for: </span>
          {capitalizeFirstLetter(material.toLowerCase())} bin @ {location}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={zoomIndex === 0}
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
            >
              <ZoomOut className="size-4" />
            </Button>
          </div>
          <SortByFilter
            onResetSortBy={handleResetSortBy}
            onApplySortBy={handleApplySortBy}
          />
          <ExportCSV data={data} binId={binId} />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-muted-foreground rounded-md border border-border bg-card">
          No results.
        </div>
      ) : (
        <div className={`grid gap-3 ${gridColsClass[columns]}`}>
          {data.map((disposal) => (
            <div
              key={disposal.id}
              className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              {disposal.imageUrl ? (
                <a href={disposal.imageUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={disposal.imageUrl}
                    alt="Detected item"
                    fill
                    sizes="(max-width: 640px) 33vw, 15vw"
                    className="object-cover hover:opacity-90 transition-opacity"
                  />
                </a>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-6" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 pb-1.5 pt-6 text-white">
                <p className="text-[11px] leading-tight font-medium">
                  {disposal.createdAt.toLocaleDateString("en-SG")}{" "}
                  {disposal.createdAt.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </p>
                <p className="text-[10px] leading-tight text-white/80">
                  {disposal.weightInGrams}g · {disposal.pointsAwarded} pts
                </p>
                <p className="text-[10px] leading-tight text-white/80 truncate">
                  {disposal.user?.name ?? "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="py-4 flex justify-end items-center">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {maxPage}
          </p>
          <div className="flex space-x-2">
            <Button disabled={page <= 1} onClick={handlePreviousClick} variant="outline" size="sm">
              {"<"}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= maxPage} onClick={handleNextClick}>
              {">"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
