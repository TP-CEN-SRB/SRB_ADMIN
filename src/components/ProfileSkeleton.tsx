import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Loading fallback for the member profile view/edit pages — a sidebar
// avatar card + a grid of stat cards, matching MemberPage/EditMemberPage.
export function ProfileSkeleton({ statCards = 9 }: { statCards?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <div className="md:col-span-1">
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="mt-4 h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 md:col-span-3">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: statCards }).map((_, i) => (
            <Card key={i} className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
