"use client";
import React, { useEffect, useState } from "react";
import SignUpBinForm from "../Form/AdminUserForms/SignUpBinForm";
import BinMapChartWithMarker from "../Map/BinMapChartWithMarker";
import { Faculty } from "@prisma/client";
import { Button } from "../ui/button";
import { IoMdClose } from "react-icons/io";
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
  const [isDesktop, setIsDesktop] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsDesktop(mediaQuery.matches);
    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({
    lat: 1.3456618,
    lng: 103.9327236,
  });
  const handleLatLngChange = (latLng: { lat: number; lng: number }) => {
    setLatLng(latLng);
  };
  return (
    <div className="flex w-full h-full md:max-h-screen md:overflow-hidden">
      <div className="overflow-y-auto flex-1">
        <SignUpBinForm
          onLatLngChange={handleLatLngChange}
          initialLatLng={{ lat: 1.3456618, lng: 103.9327236 }}
          onMobileMapShown={() => setShowMobileMap(!showMobileMap)}
          latLng={latLng}
        />
      </div>
      {isDesktop && (
        <div className="flex-1">
          <BinMapChartWithMarker
            initialLatLng={{ lat: 1.3456618, lng: 103.9327236 }}
            latLng={latLng}
            onLatLngChange={handleLatLngChange}
            data={data}
          />
        </div>
      )}
      {showMobileMap && (
        <div className="fixed top-0 left-0 w-full h-full bg-black">
          <Button
            className="absolute top-4 left-4 p-3 bg-red-500 hover:bg-red-600 rounded-md z-50 shadow-xl"
            onClick={() => setShowMobileMap(false)}
          >
            <IoMdClose stroke="white" strokeWidth={40} /> Close
          </Button>
          <BinMapChartWithMarker
            initialLatLng={latLng}
            latLng={latLng}
            onLatLngChange={handleLatLngChange}
            data={data}
          />
        </div>
      )}
    </div>
  );
};

export default CreateBinManagerScreen;
