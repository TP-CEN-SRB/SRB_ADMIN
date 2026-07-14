"use client"
import { useEffect, useState } from "react"
import BinMapChartWithMarker from "@/components/Map/BinMapChartWithMarker"
import { Faculty } from "@/generated/prisma"
import { Button } from "@/components/ui/button"
import { IoMdClose } from "react-icons/io"
import { EditBinForm } from "@/components/FormLogic/(Admin)/EditBinForm"

interface ScreenProps {
  binManager: {
    id: string
    email: string
    name: string
    faculty: Faculty
    lat: number | undefined
    long: number | undefined
    location: string | null
  }
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

const UpdateBinManagerScreen = ({ binManager, data }: ScreenProps) => {
  const [isDesktop, setIsDesktop] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const handleChange = () => setIsDesktop(mediaQuery.matches)
    handleChange()

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Safely fallback to default coordinates if binManager lat/long are undefined
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({
    lat: binManager.lat ?? 1.3456618,
    lng: binManager.long ?? 103.9327236,
  })

  const handleLatLngChange = (latLng: { lat: number; lng: number }) => {
    setLatLng(latLng)
  }

  return (
    // Applied shadcn's bg-background and text-foreground
    <div className="flex w-full h-screen md:max-h-screen md:overflow-hidden bg-background text-foreground">
      
      {/* Left Side: Form */}
      <div className="overflow-y-auto flex-1 h-full border-r border-border">
        <EditBinForm
          id={binManager.id}
          email={binManager.email}
          name={binManager.name}
          faculty={binManager.faculty}
          location={binManager.location as string}
          initialLatLng={latLng}
          onMobileMapShown={() => setShowMobileMap(!showMobileMap)}
          latLng={latLng}
        />
      </div>

      {/* Right Side: Desktop Map - Added relative and h-full w-full */}
      {isDesktop && (
        <div className="flex-1 relative h-full w-full bg-muted/20">
          <BinMapChartWithMarker
            initialLatLng={latLng}
            latLng={latLng}
            onLatLngChange={handleLatLngChange}
            data={data}
          />
        </div>
      )}

      {/* Mobile Map - Updated to fixed inset-0 and theme-aware colors */}
      {showMobileMap && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Changed to use shadcn's destructive variant */}
          <Button
            variant="destructive"
            className="absolute top-4 left-4 z-50 shadow-md gap-1"
            onClick={() => setShowMobileMap(false)}
          >
            <IoMdClose className="size-5" /> 
            Close
          </Button>
          
          {/* Added pt-16 so the map controls don't clip under the close button */}
          <div className="relative w-full h-full pt-16">
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

export default UpdateBinManagerScreen