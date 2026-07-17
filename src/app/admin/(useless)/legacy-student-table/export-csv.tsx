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
import { Student } from "./columns"
import { useSearchParams } from "next/navigation"
import { getAllStudentUsers } from "./action"
import { Loader2 } from "lucide-react"

interface ExportCSVProps<TData> {
  data: TData[]
}

const ExportCSV = <TData,>({ data }: ExportCSVProps<TData>) => {
  const searchParams = useSearchParams()
  const [allData, setAllData] = useState<Student[]>([])
  const [isPending, startTransition] = useTransition()
  const [filterOpen, setFilterOpen] = useState(false)
  const [initiateDownload, setInitiateDownload] = useState(false)
  const csvLinkRef = useRef<HTMLSpanElement>(null)

  const fetchAllData = () => {
    startTransition(async () => {
      const query = searchParams.get("query")
      const sortItem = searchParams.get("sortItem")
      const sortOrder = searchParams.get("sortOrder")
      const emailType = searchParams.get("emailType")
      const faculty = searchParams.get("faculty")
      const { students } = await getAllStudentUsers(
        null,
        query,
        (sortOrder as string) ?? undefined,
        (sortItem as string) ?? undefined,
        emailType,
        faculty
      )
      setAllData(students as unknown as Student[])
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
              filename={`students_current_page_${new Date().getTime()}.csv`}
              data={(data as Student[]).map((student) => ({
                id: student.id,
                name: student.name,
                email: student.email,
                faculty: student.faculty,
                pointBalance: student.point?.balance ?? "N/A",
                disposals: student._count?.disposals ?? 0,
                redemptions: student._count?.redemptions ?? 0,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
                pointsUpdatedAt: student.point?.updatedAt,
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
          data={allData.map((student) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            faculty: student.faculty,
            pointBalance: student.point?.balance ?? "N/A",
            disposals: student._count?.disposals ?? 0,
            redemptions: student._count.redemptions ?? 0,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
            pointsUpdatedAt: student.point?.updatedAt,
          }))}
          filename={`students_dataset_${new Date().getTime()}.csv`}
        >
          <span ref={csvLinkRef} />
        </CSVLink>
      )}
    </DropdownMenu>
  )
}

export default ExportCSV
