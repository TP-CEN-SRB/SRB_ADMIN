import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface FormSkeletonProps {
  fields?: number
  title?: boolean
}

// Generic loading fallback for single-record admin pages (edit/create forms,
// detail views) — a Card shaped like the real form: a title/description
// shimmer, N label+input shimmer pairs, and a submit-button shimmer.
export function FormSkeleton({ fields = 6, title = true }: FormSkeletonProps) {
  return (
    <Card>
      {title && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-32" />
      </CardContent>
    </Card>
  )
}
