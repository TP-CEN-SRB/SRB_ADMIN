import Link from "next/link"
import Image from "next/image"
import { ImageOff, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDisposalsByQueueId } from "@/app/action/disposal"

function capitalizeFirstLetter(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default async function DisposalQueueImagesPage({ params }: { params: Promise<{ queueId: string }> }) {
  const { queueId } = await params
  const result = await getDisposalsByQueueId(queueId)
  const disposals = ("disposals" in result ? result.disposals : undefined) ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="z-40 flex items-center justify-between bg-muted p-2">
        <span>Disposal Images</span>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/transaction">
            <Undo2 className="mr-2 size-4" />
            Back to Transactions
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {disposals.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground rounded-md border border-border bg-card">
            No disposal images found for this transaction.
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
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
                      sizes="(max-width: 640px) 50vw, 25vw"
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
                    {capitalizeFirstLetter(disposal.bin.binMaterial.name.toLowerCase())}
                  </p>
                  <p className="text-[10px] leading-tight text-white/80">
                    {disposal.weightInGrams}g · {disposal.pointsAwarded} pts
                  </p>
                  <p className="text-[10px] leading-tight text-white/80">
                    {disposal.createdAt.toLocaleDateString("en-SG")}{" "}
                    {disposal.createdAt.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: false })}
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
