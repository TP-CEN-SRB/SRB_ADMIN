import React, { useEffect, useRef, useState, useTransition } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { FaTableCells } from "react-icons/fa6"
import { PiExportBold } from "react-icons/pi"
import { IoIosDocument } from "react-icons/io"
import { CSVLink } from "react-csv"
import { Disposal } from "./columns"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getDisposalByBinId } from "@/app/action/disposal"

interface ExportCSVProps<TData> {
  data: TData[]
  binId: string
}

const ExportCSV = <TData,>({ data, binId }: ExportCSVProps<TData>) => {
  const searchParams = useSearchParams()
  const [allData, setAllData] = useState<Disposal[]>([])
  const [isPending, startTransition] = useTransition()
  const [filterOpen, setFilterOpen] = useState(false)
  const [initiateDownload, setInitiateDownload] = useState(false)
  const csvLinkRef = useRef<HTMLSpanElement>(null)

  const fetchAllData = () => {
    startTransition(async () => {
      const sortItem = searchParams.get("sortItem")
      const sortOrder = searchParams.get("sortOrder")
      const { disposals } = await getDisposalByBinId(
        binId,
        null,
        (sortOrder as string) ?? undefined,
        (sortItem as string) ?? undefined
      )
      setAllData(disposals as Disposal[])
      setInitiateDownload(true)
    })
  }

  useEffect(() => {
    if (initiateDownload && allData.length > 0) {
      csvLinkRef.current?.click()
    }
  }, [allData, initiateDownload])

  return (
    <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
      <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-1 text-sm">
        <PiExportBold /> Export
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <div
          className={isPending || data.length < 1 ? "cursor-not-allowed" : ""}
        >
          <DropdownMenuItem disabled={isPending || data.length < 1}>
            <IoIosDocument />
            <CSVLink
              className="cursor-default"
              filename={`disposals_${binId}_current_page_${new Date().getTime()}.csv`}
              data={(data as Disposal[]).map((disposal) => ({
                id: disposal.id,
                weightInGrams: disposal.weightInGrams,
                pointsAwarded: disposal.pointsAwarded,
                isRedeemed: disposal.isRedeemed,
                userId: disposal.userId,
                createdAt: disposal.createdAt,
              }))}
            >
              Export this page
            </CSVLink>
          </DropdownMenuItem>
        </div>
        <div
          className={isPending || data.length < 1 ? "cursor-not-allowed" : ""}
        >
          <DropdownMenuItem
            onClick={(e) => {
              fetchAllData()
            }}
            disabled={isPending || data.length < 1}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            <FaTableCells />
            Export this dataset
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>

      {initiateDownload && allData.length > 0 && (
        <CSVLink
          className="hidden"
          data={allData.map((disposal) => ({
            id: disposal.id,
            weightInGrams: disposal.weightInGrams,
            pointsAwarded: disposal.pointsAwarded,
            isRedeemed: disposal.isRedeemed,
            userId: disposal.userId,
            createdAt: disposal.createdAt,
          }))}
          filename={`disposals_${binId}_dataset_${new Date().getTime()}.csv`}
        >
          <span ref={csvLinkRef} />
        </CSVLink>
      )}
    </DropdownMenu>
  )
}

export default ExportCSV
