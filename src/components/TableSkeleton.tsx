import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  columns: number
  rows?: number
  showHeader?: boolean
}

// Generic loading fallback for the admin list pages (bins, members, bin
// managers, quests, events, templates, store) — approximates the shape of
// the real header bar + table so navigation shows a skeleton in place
// rather than a full-page spinner. `showHeader` can be turned off for
// pages whose filter/search header doesn't depend on the data itself
// (e.g. feedback), since that header already renders outside the Suspense
// boundary in those cases.
export function TableSkeleton({ columns, rows = 8, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {showHeader && (
        <header className="z-40 flex items-center justify-between bg-muted p-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
