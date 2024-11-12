"use client";
import { getPointByAdminNumber } from "@/app/action/point";
import ButtonRedirect from "@/components/Button/ButtonRedirect";
import CardHeader from "@/components/Card/CardHeader";
import UserCard from "@/components/Card/UserCard";
import React, { useEffect, useState, useTransition } from "react";
import { MdError } from "react-icons/md";
import { BeatLoader } from "react-spinners";

const PointsPage = ({ params }: { params: { id: string } }) => {
  const [isPending, startTransition] = useTransition();
  const [userPoint, setUserPoint] = useState<number>();
  useEffect(() => {
    startTransition(async () => {
      const point = await getPointByAdminNumber(params.id);
      setUserPoint(point?.balance);
    });
  }, [params.id]);

  return (
    <UserCard>
      <CardHeader>Points Information</CardHeader>
      {!isPending ? (
        userPoint ? (
          <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
            <h2>
              <span className="font-medium text-blue-700">Admin Number:</span>{" "}
              {params.id}
            </h2>
            <h2>
              <span className="font-medium text-blue-700">Balance:</span>{" "}
              {userPoint}
            </h2>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-y-2">
            <MdError size={100} className="text-red-500" />
            <h2 className="text-2xl font-semibold text-red-600">
              Oops! User not found
            </h2>
            <p className="text-slate-500">
              Start disposing now to earn points!
            </p>
          </div>
        )
      ) : (
        <div className="flex justify-center my-10">
          <BeatLoader color="#22c55e" />
        </div>
      )}

      <ButtonRedirect
        rounded
        href="/my-points"
        variant="outline"
        color="indigo"
      >
        Back
      </ButtonRedirect>
    </UserCard>
  );
};

export default PointsPage;
