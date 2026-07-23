"use client"

import React, { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import EventUserFilterDropdown from "@admin/components/EventUserFilterDropdown"

const PAGE_SIZE = 20

type UserInEvent = {
  points: number
  user: {
    id: string
    name: string | null
    email: string
    faculty: string
  }
}

type Props = {
  usersInEvent: UserInEvent[]
}

const ClientEventUserTable = ({ usersInEvent }: Props) => {
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [pageIndex, setPageIndex] = useState(0)

  const filteredUsers = useMemo(() => {
    return usersInEvent
      .filter(({ user }) => {
        const facultyMatch =
          selectedFaculties.length === 0 || selectedFaculties.includes(user.faculty)
        const nameMatch = (user.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        return facultyMatch && nameMatch
      })
      .sort((a, b) => b.points - a.points)
  }, [usersInEvent, selectedFaculties, searchTerm])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1)
  const pagedUsers = filteredUsers.slice(
    clampedPageIndex * PAGE_SIZE,
    clampedPageIndex * PAGE_SIZE + PAGE_SIZE
  )

  function updateFilters(mutate: () => void) {
    mutate()
    setPageIndex(0)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center gap-4 mb-4">
        <Input
          type="search"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => updateFilters(() => setSearchTerm(e.target.value))}
          className="w-full max-w-sm"
        />
        <EventUserFilterDropdown
          selectedFaculties={selectedFaculties}
          onChange={(newFilters) => updateFilters(() => setSelectedFaculties(newFilters.faculty))}
        />
      </div>

      <div className="flex-1 overflow-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Faculty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedUsers.length > 0 ? (
              pagedUsers.map((entry) => (
                <tr key={entry.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.user.name ?? "Unnamed User"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.user.faculty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No matching users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4">
        <span className="text-sm text-muted-foreground">
          Page {clampedPageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
          disabled={clampedPageIndex === 0}
        >
          {"<"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
          disabled={clampedPageIndex >= pageCount - 1}
        >
          {">"}
        </Button>
      </div>
    </div>
  )
}

export default ClientEventUserTable
