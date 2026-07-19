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
import { Transaction } from "./columns"
import { useSearchParams } from "next/navigation"
import { getTransactionByUserId } from "@/app/action/transaction"
import { Loader2 } from "lucide-react"

interface ExportCSVProps<TData> {
  data: TData[]
  userId: string
}

const ExportCSV = <TData,>({ data, userId }: ExportCSVProps<TData>) => {
  const searchParams = useSearchParams()
  const [allData, setAllData] = useState<Transaction[]>([])
  const [isPending, startTransition] = useTransition()
  const [filterOpen, setFilterOpen] = useState(false)
  const [initiateDownload, setInitiateDownload] = useState(false)
  const csvLinkRef = useRef<HTMLSpanElement>(null)

  const fetchAllData = function(){
    startTransition(async function(){
      const sortOrder = searchParams.get("sortOrder")
      const transactionType = searchParams.get("transactionType")
      const { transactions } = await getTransactionByUserId(
        userId,
        null,
        (sortOrder as string) ?? undefined,
        transactionType
      )
      setAllData(transactions as Transaction[])
      setInitiateDownload(true)
    })
  }

  useEffect(function(){
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
              filename={`transactions_${userId}_current_page_${new Date().getTime()}.csv`}
              data={(data as Transaction[]).map((transaction) => ({
                id: transaction.id,
                pointsChange: transaction.pointsChange,
                description: transaction.description,
                transactionType: transaction.transactionType,
                createdAt: transaction.createdAt,
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
          data={allData.map((transaction) => ({
            id: transaction.id,
            pointsChange: transaction.pointsChange,
            description: transaction.description,
            transactionType: transaction.transactionType,
            createdAt: transaction.createdAt,
          }))}
          filename={`transactions_${userId}_dataset_${new Date().getTime()}.csv`}
        >
          <span ref={csvLinkRef} />
        </CSVLink>
      )}
    </DropdownMenu>
  )
}

export default ExportCSV
