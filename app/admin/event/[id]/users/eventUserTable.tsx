"use client";

import React from "react";

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
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
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
          {usersInEvent.map((entry, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {entry.user.name ?? "Unnamed User"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{entry.user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{entry.user.faculty}</td>
              <td className="px-6 py-4 whitespace-nowrap">{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientEventUserTable;
