"use client";
import React, { useState } from "react";
import SignUpBinForm from "../Form/AdminUserForms/SignUpBinForm";
import CreateBinMapChart from "../Map/CreateBinMapChart";
import { Faculty } from "@prisma/client";
interface ScreenProps {
  data: {
    id: string;
    name: string;
    email: string;
    faculty: Faculty;
    _count: { bins: number };
    lat: number | undefined;
    long: number | undefined;
  }[];
}

const CreateBinManagerScreen = ({ data }: ScreenProps) => {
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({
    lat: 1.3456618,
    lng: 103.9327236,
  });
  const handleLatLngChange = (latLng: { lat: number; lng: number }) => {
    setLatLng(latLng);
  };
  return (
    <div className="flex w-full h-full max-h-screen overflow-hidden">
      <div className="overflow-y-auto flex-1">
        <SignUpBinForm latLng={latLng} />
      </div>
      <div className="flex-1">
        <CreateBinMapChart
          latLng={latLng}
          onLatLngChange={handleLatLngChange}
          data={data}
        />
      </div>
    </div>
  );
};

export default CreateBinManagerScreen;
