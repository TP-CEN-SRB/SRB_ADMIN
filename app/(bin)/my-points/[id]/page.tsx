import { getPointByAdminNumber } from "@/app/action/point";
import CardButton from "@/components/Card/CardButton";
import UserCard from "@/components/Card/UserCard";
import React from "react";

const PointsPage = async ({ params }: { params: { id: string } }) => {
  const point = await getPointByAdminNumber(params.id);

  return (
    <UserCard>
      <div className="flex items-center mb-4">
        <h1>Points Information</h1>
      </div>
      {point ? (
        <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
          <h2>
            <span className="font-medium text-blue-700">Admin Number:</span>{" "}
            {params.id}
          </h2>
          <h2>
            <span className="font-medium text-blue-700">Points Balance:</span>{" "}
            {point.balance}
          </h2>
        </div>
      ) : (
        <>
          <h2 className="text-2xl text-center font-semibold text-red-700 ">
            Oops! User not found
          </h2>
          <p className="mt-4 text-gray-500 text-center">
            Start disposing now to earn points!
          </p>
        </>
      )}
      <CardButton color="blue" href="/my-points">
        Back
      </CardButton>
    </UserCard>
  );
};

export default PointsPage;
