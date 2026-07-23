"use client"

import React, { useMemo, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import QuestUserFilterDropdown from "@admin/components/QuestUserFilterDropdown"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 20

interface UserQuest {
  user: {
    id: string
    name: string
    email: string
    faculty: string
  }
  progress: number
  isCompleted: boolean
}

const ClientQuestUserTable = ({ usersInQuest }: { usersInQuest: UserQuest[] }) => {
  const [filters, setFilters] = useState({ faculty: [] as string[], completion: [] as string[] })
  const [searchTerm, setSearchTerm] = useState("")
  const [pageIndex, setPageIndex] = useState(0)

  const filteredUsers = useMemo(() => {
    return usersInQuest
      .filter(({ user, isCompleted }) => {
        const facultyMatch =
          filters.faculty.length === 0 || filters.faculty.includes(user.faculty)
        const completionMatch =
          filters.completion.length === 0 ||
          filters.completion.includes(isCompleted ? "Completed" : "Not Completed")
        const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase())

        return facultyMatch && completionMatch && nameMatch
      })
      .sort((a, b) => Number(b.isCompleted) - Number(a.isCompleted))
  }, [usersInQuest, filters, searchTerm])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1)
  const pagedUsers = filteredUsers.slice(
    clampedPageIndex * PAGE_SIZE,
    clampedPageIndex * PAGE_SIZE + PAGE_SIZE
  )

  function updateSearch(value: string) {
    setSearchTerm(value)
    setPageIndex(0)
  }

  function updateFilters(value: { faculty: string[]; completion: string[] }) {
    setFilters(value)
    setPageIndex(0)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center gap-4 mb-4">
        <Input
          type="search"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => updateSearch(e.target.value)}
          className="w-full max-w-sm"
        />
        <QuestUserFilterDropdown
          selectedFaculties={filters.faculty}
          selectedCompletion={filters.completion}
          onChange={updateFilters}
        />
      </div>

      <div className="flex-1 overflow-auto rounded border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Faculty</th>
              <th className="border px-4 py-2">Progress</th>
              <th className="border px-4 py-2 text-center">Completed</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.length > 0 ? (
              pagedUsers.map(({ user, progress, isCompleted }) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.faculty}</td>
                  <td className="px-4 py-2">{progress}%</td>
                  <td className="px-4 py-2 text-center">
                    {isCompleted ? (
                      <CheckCircle className="text-green-600 inline-block" />
                    ) : (
                      <XCircle className="text-gray-400 inline-block" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
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

export default ClientQuestUserTable
