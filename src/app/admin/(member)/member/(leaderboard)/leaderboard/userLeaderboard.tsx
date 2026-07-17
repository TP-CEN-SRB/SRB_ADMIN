"use client"

import React, { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getTopTenUsers } from "@/app/action/user"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table"
import { FaArrowRight } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { getNameInitials } from "@/utils/getNameInitials"
import { DateRange } from "@/utils/dateUtils"

type FilterPeriod = "week" | "month" | "year"

type User = {
  username: string | undefined
  userId: string | undefined
  profileImageUrl?: string | null // ✅ ADD THIS
  balance: number
  disposalCount: number
  redemptionCount: number
  mostFrequentMaterial: string | undefined
}

interface LeaderboardData {
  username: string | undefined
  userId: string | undefined
  profileImageUrl?: string | null // ✅ ADD THIS
  balance: number
  disposalCount: number
  redemptionCount: number
  mostFrequentMaterial: string | undefined
}


const UsersLeaderboard = ({
  leaderBoardData,
}: {
  leaderBoardData: LeaderboardData[]
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>("week")
  const [leaderBoard, setLeaderBoard] =
    useState<LeaderboardData[]>(leaderBoardData)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const getDateRange = (period: FilterPeriod) => DateRange(period)

  const handlePeriodChange = useCallback(async (period: FilterPeriod) => {
    setIsLoading(true)
    try {
      const { startDate, endDate } = getDateRange(period)
      const filteredData = await getTopTenUsers(startDate, endDate)
      setLeaderBoard(filteredData)
      setActivePeriod(period)
      // reset pagination when filter changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [getDateRange])

const columns: ColumnDef<User>[] = useMemo(() => [
    {
      id: "username",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3 justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={user.username ?? "User"}
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xs font-semibold">
                  {getNameInitials(user.username ?? "")}
                </span>
              )}
            </div>
            <span className="font-medium truncate max-w-[120px]">
              {user.username}
            </span>
          </div>
        )
      },
    },
    {
      id: "balance",
      header: "Points",
      accessorKey: "balance",
      cell: ({ getValue }) => (
        <span className="font-bold text-emerald-600">
          {getValue<number>()}
        </span>
      ),
    },
    {
      id: "disposalCount",
      header: "Disposal Count",
      accessorKey: "disposalCount",
    },
    {
      id: "redemptionCount",
      header: "Redemption Count",
      accessorKey: "redemptionCount",
    },
    {
      id: "mostFrequentMaterial",
      header: "Most thrown Material",
      accessorKey: "mostFrequentMaterial",
    },
    {
      id: "actions",
      header: "View",
      cell: ({ row }) => (
        <button
          className="flex bg-blue-500 hover:bg-blue-300 justify-center items-center text-white font-bold py-2 px-4 rounded-lg w-auto h-full"
          onClick={() => router.push(`/admin/member/${row.original.userId}`)}
        >
          View Profile
          <FaArrowRight className="ml-2" />
        </button>
      ),
    },
  ], [router])

  const topThree = useMemo(() => leaderBoard.slice(0, 3), [leaderBoard])
  const tableData = useMemo(() => leaderBoard.slice(3), [leaderBoard])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  })

  return (
    <div className="p-2 md:p-4 w-full">
      {/* Header Section */}
      <div className="flex flex-col w-full justify-center text-center items-center gap-4 py-4">
        <h1 className="text-2xl md:text-4xl font-bold">Leaderboard</h1>
        <div className="flex rounded-lg border-solid border-2 border-slate-400 w-full max-w-sm">
          {(["week", "month", "year"] as FilterPeriod[]).map(
            (period, index) => (
              <React.Fragment key={period}>
                {index > 0 && <div className="w-[2px] bg-slate-300" />}
                <Button
                  className={`
                  flex-1
                  text-sm md:text-base
                  ${
                    index === 0
                      ? "rounded-r-none"
                      : index === 2
                      ? "rounded-l-none"
                      : "rounded-none"
                  }
                  hover:bg-slate-300
                  ${activePeriod === period ? "bg-gray-400" : ""}
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                  variant="secondary"
                  onClick={() => handlePeriodChange(period)}
                  disabled={isLoading}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              </React.Fragment>
            )
          )}
        </div>
      </div>

      {/* Top Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {topThree.map((item, index) => (
          <TopUserCard
            key={item.userId}
            user={item}
            rank={index}
            onViewProfile={() => router.push(`/admin/member/${item.userId}`)}
          />
        ))}
      </div>

      {/* Table Section */}
      <div className="mt-4 overflow-x-auto">
        <div className="rounded-md border bg-white shadow-lg min-w-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-center whitespace-nowrap px-2 py-3 text-sm md:text-base font-bold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-center whitespace-nowrap px-2 py-3 text-sm md:text-base"
                        >
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
                      className="h-24 text-center text-sm md:text-base"
                    >
                      {isLoading ? "Loading..." : "No results."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

const TopUserCard = ({
  user,
  rank,
  onViewProfile,
}: {
  user: LeaderboardData
  rank: number
  onViewProfile: () => void
}) => {
  const icons = ["/first_icon.png", "/second_icon.png", "/third_icon.png"]
  const gradients = ["to-yellow-200", "to-slate-400", "to-yellow-700"]

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col relative w-full">
      <div
        className={`flex justify-end w-full h-32 md:h-40 bg-linear-to-tr from-white ${gradients[rank]} px-4 rounded-t-lg`}
      >
        <Image
          src={icons[rank]}
          alt={`Icon ${rank + 1}`}
          width={112} 
          height={128}
          className="h-24 w-20 md:h-32 md:w-28"
        />
      </div>
      <div className="absolute top-20 md:top-24 left-4 md:left-8">
        <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full shadow-md overflow-hidden flex justify-center items-center">
          {user.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt={user.username ?? "User profile"}
              width={112}
              height={112}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-2xl md:text-4xl font-bold">
              {getNameInitials(user.username as string)}
            </span>
          )}
        </div>
      </div>
      <div className="ml-4 md:ml-8 mt-2 mb-4 h-16 md:h-20 flex justify-start items-end">
        <span className="text-xl md:text-3xl font-bold truncate">
          {user.username}
        </span>
      </div>
      <div className="grid grid-cols-2 md:px-8 px-4 pb-6 gap-4">
        <StatItem label="Disposals" value={user.disposalCount} />
        <StatItem label="Points" value={user.balance} />
        <StatItem label="Redemptions" value={user.redemptionCount.toString()} />
        <StatItem label="Material" value={user.mostFrequentMaterial || "N/A"} />
      </div>
      <Button
        className="mx-4 mb-4 bg-blue-500 hover:bg-blue-300 text-white text-sm md:text-base"
        onClick={onViewProfile}
      >
        View Profile
        <FaArrowRight className="ml-2" />
      </Button>
    </div>
  )
}

const StatItem = ({
  label,
  value,
}: {
  label: string
  value: string | number
}) => (
  <div className="flex flex-col">
    <span className="text-xl md:text-2xl font-bold">{value}</span>
    <span className="text-xs md:text-sm">{label}</span>
  </div>
)

export default UsersLeaderboard
