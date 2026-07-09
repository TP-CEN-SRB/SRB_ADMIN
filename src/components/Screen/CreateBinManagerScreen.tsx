"use client"
import React, { useEffect, useState } from "react"
import { SignUpBinForm } from "@/components/FormLogic/(Admin)/SignUpBinForm"
import BinMapChartWithMarker from "../Map/BinMapChartWithMarker"
import { Faculty } from "@/generated/prisma"
import { Button } from "../ui/button"
import { IoMdClose } from "react-icons/io"
interface ScreenProps {
  data: {
    id: string
    name: string
    email: string
    faculty: Faculty
    _count: { bins: number }
    lat: number | undefined
    long: number | undefined
  }[]
}

const CreateBinManagerScreen = ({ data }: ScreenProps) => {
  const [isDesktop, setIsDesktop] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const handleChange = () => setIsDesktop(mediaQuery.matches)
    handleChange()

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({
    lat: 1.3456618,
    lng: 103.9327236,
  })

  function handleLatLngChange(latLng: { lat: number; lng: number }){
    setLatLng(latLng)
  }
return (
    <div className="flex w-full h-screen md:max-h-screen md:overflow-hidden">
      
      {/* Left Side: Form */}
      <div className="overflow-y-auto flex-1 h-full">
        <SignUpBinForm
          onLatLngChange={handleLatLngChange}
          initialLatLng={{ lat: 1.3456618, lng: 103.9327236 }}
          onMobileMapShown={() => setShowMobileMap(!showMobileMap)}
          latLng={latLng}
        />
      </div>

      {/* Right Side: Desktop Map - ADDED relative AND h-full */}
      {isDesktop && (
        <div className="flex-1 relative h-full w-full">
          <BinMapChartWithMarker
            initialLatLng={{ lat: 1.3456618, lng: 103.9327236 }}
            latLng={latLng}
            onLatLngChange={handleLatLngChange}
            data={data}
          />
        </div>
      )}

      {/* Mobile Map - Ensure the map inside can stretch */}
      {showMobileMap && (
        <div className="fixed top-0 left-0 w-full h-full bg-black z-50">
          <Button
            className="absolute top-4 left-4 p-3 bg-red-500 hover:bg-red-600 rounded-md z-50 shadow-xl"
            onClick={() => setShowMobileMap(false)}
          >
            <IoMdClose stroke="white" strokeWidth={40} /> Close
          </Button>
          
          <div className="relative w-full h-full pt-20"> {/* Wrapper for mobile map */}
            <BinMapChartWithMarker
              initialLatLng={latLng}
              latLng={latLng}
              onLatLngChange={handleLatLngChange}
              data={data}
            />
          </div>
        </div>
      )}
    </div>
  )
}
export default CreateBinManagerScreen