import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FaTableCells } from "react-icons/fa6";
import { PiExportBold } from "react-icons/pi";
import { IoIosDocument } from "react-icons/io";
import { CSVLink } from "react-csv";
import { Student } from "./columns";
import { useSearchParams } from "next/navigation";
import { getAllStudentUsers } from "@/app/action/user";
import { Loader2 } from "lucide-react";

interface ExportCSVProps<TData> {
  data: TData[];
}

const ExportCSV = <TData,>({ data }: ExportCSVProps<TData>) => {
  const searchParams = useSearchParams();
  const [allData, setAllData] = useState<Student[]>([]);
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
  const [initiateDownload, setInitiateDownload] = useState(false);
  const csvLinkRef = useRef<HTMLSpanElement>(null);

  const fetchAllData = () => {
    startTransition(async () => {
      const query = searchParams.get("query");
      const sortItem = searchParams.get("sortItem");
      const sortOrder = searchParams.get("sortOrder");
      const emailType = searchParams.get("emailType");
      const faculty = searchParams.get("faculty");
      const { studentCount, students } = await getAllStudentUsers(
        null,
        query,
        (sortOrder as string) ?? undefined,
        (sortItem as string) ?? undefined,
        emailType,
        faculty
      );
      setAllData(students as Student[]);
      setInitiateDownload(true);
    });
  };

  useEffect(() => {
    if (initiateDownload && allData.length > 0) {
      csvLinkRef.current?.click();
    }
  }, [allData, initiateDownload]);

  return (
    <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
      <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-1 text-sm">
        <PiExportBold /> Export
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem disabled={isPending}>
          <IoIosDocument />
          <CSVLink
            className="cursor-default"
            filename={`${new Date().getTime()}_current_page`}
            data={(data as Student[]).map((student) => ({
              id: student.id,
              name: student.name,
              email: student.email,
              pointBalance: student.point?.balance ?? "N/A",
              disposals: student._count?.disposals ?? 0,
            }))}
          >
            Export this page
          </CSVLink>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            fetchAllData();
          }}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
          <FaTableCells />
          Export this dataset
        </DropdownMenuItem>
      </DropdownMenuContent>

      {initiateDownload && allData.length > 0 && (
        <CSVLink
          className="hidden"
          data={allData.map((student) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            pointBalance: student.point?.balance ?? "N/A",
            disposals: student._count?.disposals ?? 0,
          }))}
          filename={`${new Date().getTime()}_entire_dataset`}
        >
          <span ref={csvLinkRef} />
        </CSVLink>
      )}
    </DropdownMenu>
  );
};

export default ExportCSV;
