import { getPointByAdminNumber } from "@/app/action/point";
import Card from "@/components/Card/Card";
import React from "react";
import { FaUserCircle } from "react-icons/fa";

const PointsPage = async ({ params }: { params: { id: string } }) => {
  const point = await getPointByAdminNumber(params.id);

  return (
    <Card>
      <div className="flex items-center mb-4">
        <FaUserCircle className="text-blue-600 md:text-5xl text-4xl mr-3" />
        <h1>Points Information</h1>
      </div>
      {point ? (
        <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
          <p className="text-gray-700 text-lg">
            <span className="font-medium text-blue-700">Admin ID:</span>{" "}
            {params.id}
          </p>
          <p className="text-gray-700 text-lg mt-2">
            <span className="font-medium text-blue-700">Points Balance:</span>{" "}
            {point.balance}
          </p>
        </div>
      ) : (
        <p className="text-center text-red-600 font-medium mt-4">
          No user found
        </p>
      )}
    </Card>
  );
};

export default PointsPage;
