"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import EventUserFilterDropdown from "@admin/components/EventUserFilterDropdown";

type UserInEvent = {
  points: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    faculty: string;
  };
};

type Props = {
  usersInEvent: UserInEvent[];
};

const ClientEventUserTable = ({ usersInEvent }: Props) => {
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersInEvent
    .filter(({ user }) => {
      const facultyMatch =
        selectedFaculties.length === 0 || selectedFaculties.includes(user.faculty);
      const nameMatch = (user.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      return facultyMatch && nameMatch;
    })
    .sort((a, b) => b.points - a.points);

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
        <EventUserFilterDropdown
          selectedFaculties={selectedFaculties}
          onChange={(newFilters) => setSelectedFaculties(newFilters.faculty)}
        />
      </div>

      <div className="overflow-x-auto border rounded-lg">
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((entry) => (
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
    </>
  );
};

export default ClientEventUserTable;
