"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import QuestUserFilterDropdown from "@admin/components/QuestUserFilterDropdown";
import { Input } from "@/components/ui/input";

interface UserQuest {
  user: {
    id: string;
    name: string;
    email: string;
    faculty: string;
  };
  progress: number;
  isCompleted: boolean;
}

const ClientQuestUserTable = ({ usersInQuest }: { usersInQuest: UserQuest[] }) => {
  const [filters, setFilters] = useState({ faculty: [] as string[], completion: [] as string[] });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersInQuest.filter(({ user, isCompleted }) => {
    const facultyMatch =
      filters.faculty.length === 0 || filters.faculty.includes(user.faculty);
    const completionMatch =
      filters.completion.length === 0 ||
      filters.completion.includes(isCompleted ? "Completed" : "Not Completed");
    const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());

    return facultyMatch && completionMatch && nameMatch;
  });

  return (
    <>
      <div className="flex justify-between items-center gap-4 mb-4">
        <Input
          type="search"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm"
        />
        <QuestUserFilterDropdown
          selectedFaculties={filters.faculty}
          selectedCompletion={filters.completion}
          onChange={setFilters}
        />
      </div>

      <div className="overflow-x-auto rounded border">
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map(({ user, progress, isCompleted }) => (
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
    </>
  );
};

export default ClientQuestUserTable;
