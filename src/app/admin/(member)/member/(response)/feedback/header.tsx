"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"

interface FeedbackHeaderProps {
  view: "feedback" | "reports"
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function FeedbackHeader({ view, currentPage, currentLimit, totalPages, totalCount }: FeedbackHeaderProps) {
  const { searchParams, isPending, pushParams, setLimit, goToPage } =
    useTableQueryParams({ currentPage, totalPages })

  const currentStatus = searchParams.get("status") || "ALL"

  function onToggleView(newView: "feedback" | "reports") {
    pushParams(function (params) {
      params.set("view", newView)
      params.delete("search")
      params.delete("status")
      params.set("page", "1")
    })
  }

  function onSearch(search: string) {
    pushParams(function (params) {
      params.set("search", search)
      params.set("page", "1")
    })
  }

  function onStatusChange(status: string) {
    pushParams(function (params) {
      params.set("status", status)
      params.set("page", "1")
    })
  }

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border bg-background p-0.5">
          <Button
            size="sm"
            variant="ghost"
            className={cn("rounded-sm", view === "feedback" && "bg-muted")}
            onClick={function () { onToggleView("feedback") }}
            disabled={isPending}
          >
            Feedback
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn("rounded-sm", view === "reports" && "bg-muted")}
            onClick={function () { onToggleView("reports") }}
            disabled={isPending}
          >
            Fault Reports
          </Button>
        </div>

        <Input
          placeholder={view === "feedback" ? "search category, name or email..." : "search category, location, name or email..."}
          className="text-sm w-72"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={function (e) { onSearch(e.target.value) }}
        />

        {view === "reports" && (
          <Select value={currentStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="text-sm w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TablePaginationControls
          currentPage={currentPage}
          currentLimit={currentLimit}
          totalPages={totalPages}
          totalCount={totalCount}
          isPending={isPending}
          onLimitChange={setLimit}
          onPageChange={goToPage}
        />
      </div>
    </header>
  )
}
