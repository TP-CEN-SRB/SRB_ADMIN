"use client"
import { useEffect, useState } from "react"
import StoreMapChartWithMarker from "../../StoreMapChartWithMarker"
import { Faculty } from "@/generated/prisma"
import { Button } from "@/components/ui/button"
import { IoMdClose } from "react-icons/io"
import { EditStoreLocationForm } from "./EditStoreLocationForm"

// Mirrors UpdateBinManagerScreen (bin manager edit).
interface ScreenProps {
  store: {
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
    _count: { fulfilledRedemptions: number }
    lat: number | undefined
    long: number | undefined
  }[]
}

const UpdateStoreScreen = ({ store, data }: ScreenProps) => {
  const [isDesktop, setIsDesktop] = useState(false)
  const [showMobileMap, setShowMobileMap] = useState(false)

  useEffect(function(){
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const handleChange = () => setIsDesktop(mediaQuery.matches)
    handleChange()

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Safely fallback to default coordinates if the store has no pin yet.
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({
    lat: store.lat ?? 1.3456618,
    lng: store.long ?? 103.9327236,
  })

  const handleLatLngChange = (latLng: { lat: number; lng: number }) => {
    setLatLng(latLng)
  }

  return (
    <div className="flex w-full h-screen md:max-h-screen md:overflow-hidden bg-background text-foreground">

      {/* Left Side: Form */}
      <div className="overflow-y-auto flex-1 h-full border-r border-border">
        <EditStoreLocationForm
          id={store.id}
          email={store.email}
          name={store.name}
          faculty={store.faculty}
          location={store.location ?? ""}
          initialLatLng={latLng}
          onMobileMapShown={() => setShowMobileMap(!showMobileMap)}
          latLng={latLng}
        />
      </div>

      {/* Right Side: Desktop Map */}
      {isDesktop && (
        <div className="flex-1 relative h-full w-full bg-muted/20">
          <StoreMapChartWithMarker
            initialLatLng={latLng}
            latLng={latLng}
            onLatLngChange={handleLatLngChange}
            data={data}
          />
        </div>
      )}

      {/* Mobile Map */}
      {showMobileMap && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <Button
            variant="destructive"
            className="absolute top-4 left-4 z-50 shadow-md gap-1"
            onClick={() => setShowMobileMap(false)}
          >
            <IoMdClose className="size-5" />
            Close
          </Button>

          <div className="relative w-full h-full pt-16">
            <StoreMapChartWithMarker
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

export default UpdateStoreScreen
