import Image from "next/image"
import { ImageOff } from "lucide-react"
import { getDisposalByBinId } from "@/app/action/disposal"
import { DisposalHeader } from "./disposalHeader"

const ZOOM_LEVELS = [3, 5, 7] as const

const gridColsClass: Record<(typeof ZOOM_LEVELS)[number], string> = {
  3: "grid-cols-2 sm:grid-cols-3",
  5: "grid-cols-3 sm:grid-cols-5",
  7: "grid-cols-4 sm:grid-cols-7",
}

function capitalizeFirstLetter(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default async function ViewBinDisposalPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string }>
}){
  const { id } = await params
  const sp = await searchParams
  const currentPage = Number(sp?.page) || 1
  const currentLimit = Number(sp?.limit) || 20
  const sort = sp.sort
  const zoom = (ZOOM_LEVELS.includes(Number(sp.zoom) as (typeof ZOOM_LEVELS)[number])
    ? Number(sp.zoom)
    : 3) as (typeof ZOOM_LEVELS)[number]

  const { disposalCount, disposals, bin, totalPages } = await getDisposalByBinId(
    id,
    currentPage,
    currentLimit,
    sort
  )

  const material = bin?.binMaterial.name ? capitalizeFirstLetter(bin.binMaterial.name.toLowerCase()) : ""
  const location = bin?.user.location ?? ""

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DisposalHeader
        currentPage={currentPage}
        currentLimit={currentLimit}
        totalPages={totalPages ?? 1}
        totalCount={disposalCount ?? 0}
        zoom={zoom}
        material={material}
        location={location}
      />

      <div className="flex-1 overflow-auto p-4">
        {!disposals || disposals.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground rounded-md border border-border bg-card">
            No results.
          </div>
        ) : (
          <div className={`grid gap-3 ${gridColsClass[zoom]}`}>
            {disposals.map((disposal) => (
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
      </div>
    </div>
  )
}
