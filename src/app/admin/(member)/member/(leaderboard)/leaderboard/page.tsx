import Link from "next/link"
import { Suspense } from "react"
import { Trophy, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableHead, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getTopTwentyUsers, getMyRank } from "./action"

const col_widths = ["10%", "35%", "18%", "13%", "13%", "11%"]

function initialsFor(name: string | null | undefined) {
  return name ? name.substring(0, 2).toUpperCase() : "US"
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top 20 members ranked by current points</p>
      </div>

      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </div>
  )
}

async function LeaderboardContent() {
  const [leaderboard, myRank] = await Promise.all([getTopTwentyUsers(), getMyRank()])
  const [first, second, third] = leaderboard
  const rest = leaderboard.slice(3)

  return (
    <>
      {myRank && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={myRank.profileImageUrl || ""} alt={myRank.username ?? "You"} />
              <AvatarFallback className="text-xs">{initialsFor(myRank.username)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Your rank</p>
              <p className="text-xs text-muted-foreground">{myRank.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold">#{myRank.rank}</p>
              <p className="text-[10px] text-muted-foreground">Rank</p>
            </div>
            <div className="text-center">
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-yellow-600">
                {myRank.balance} <Star className="size-3 fill-yellow-600" />
              </p>
              <p className="text-[10px] text-muted-foreground">Points</p>
            </div>
          </div>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No ranked members yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 items-end gap-4 mb-10 max-w-3xl mx-auto">
            <PodiumSpot user={second} rank={2} />
            <PodiumSpot user={first} rank={1} />
            <PodiumSpot user={third} rank={3} />
          </div>

          {rest.length > 0 && (
            <div className="rounded-lg border overflow-hidden">
              <Table className="table-fixed">
                <colgroup>
                  {col_widths.map((width, index) => (
                    <col key={index} style={{ width }} />
                  ))}
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-center">Disposals</TableHead>
                    <TableHead className="text-center">Redemptions</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rest.map((user, index) => (
                    <TableRow key={user.userId}>
                      <TableCell className="text-center"><span className="text-xs font-medium">#{index + 4}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={user.profileImageUrl || ""} alt={user.username ?? "Member"} />
                            <AvatarFallback className="text-[10px]">{initialsFor(user.username)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-medium text-yellow-600 flex items-center justify-center gap-1">
                          {user.balance} <Star className="size-3 fill-yellow-600" />
                        </span>
                      </TableCell>
                      <TableCell className="text-center"><span className="text-xs">{user.disposalCount}</span></TableCell>
                      <TableCell className="text-center"><span className="text-xs">{user.redemptionCount}</span></TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/member/${user.userId}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </>
  )
}

function LeaderboardSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-3 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>

      <div className="grid grid-cols-3 items-end gap-4 mb-10 max-w-3xl mx-auto">
        {[2, 1, 3].map((rank) => (
          <div key={rank} className="flex flex-col items-center">
            <Skeleton className={cn("rounded-full", rank === 1 ? "size-24" : "size-16")} />
            <Skeleton className="mt-2 h-4 w-20" />
            <Skeleton className="mt-2 h-3 w-12" />
            <Skeleton
              className={cn(
                "w-full mt-3 rounded-t-lg",
                rank === 1 ? "h-28" : rank === 2 ? "h-20" : "h-16"
              )}
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden p-4 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

type PodiumUser = {
  username: string | undefined | null
  userId: string | undefined
  profileImageUrl?: string | null
  balance: number
}

function PodiumSpot({ user, rank }: { user: PodiumUser | undefined; rank: 1 | 2 | 3 }) {
  if (!user) {
    return <div className={cn(rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3")} />
  }

  const medalColor =
    rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-400" : "text-amber-700"
  const podiumHeight = rank === 1 ? "h-28" : rank === 2 ? "h-20" : "h-16"
  const avatarSize = rank === 1 ? "size-24" : "size-16"
  const order = rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3"

  return (
    <div className={cn("flex flex-col items-center", order)}>
      <Trophy className={cn("size-6 mb-1", medalColor)} />
      <Avatar className={avatarSize}>
        <AvatarImage src={user.profileImageUrl || ""} alt={user.username ?? "Member"} />
        <AvatarFallback className="text-lg font-semibold">{initialsFor(user.username)}</AvatarFallback>
      </Avatar>
      <h3 className="mt-2 font-semibold text-center truncate max-w-full">{user.username || "Unknown"}</h3>
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        {user.balance} <Star className="size-3 fill-yellow-500 text-yellow-500" />
      </p>
      <Button variant="outline" size="sm" className="mt-2" asChild>
        <Link href={`/admin/member/${user.userId}`}>View Profile</Link>
      </Button>
      <div className={cn("w-full mt-3 rounded-t-lg bg-muted flex items-start justify-center pt-2", podiumHeight)}>
        <span className="text-3xl font-bold text-muted-foreground">#{rank}</span>
      </div>
    </div>
  )
}
