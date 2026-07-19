"use client"
import { maxBound } from "@/utils/map"
import { Faculty } from "@/generated/prisma"
import Map, {
  AttributionControl,
  FullscreenControl,
  Marker,
  MarkerDragEvent,
  MapRef,
  NavigationControl,
  Popup,
  ScaleControl,
} from "react-map-gl"
import { useCallback, useEffect, useRef, useState } from "react"
import { IoLocationSharp } from "react-icons/io5"
import { useTheme } from "next-themes" // <-- 1. Import useTheme

interface MapChartProps {
  data: {
    id: string
    name: string
    email: string
    faculty: Faculty
    _count: { bins: number }
    lat: number | undefined
    long: number | undefined
  }[]
  latLng: { lat: number; lng: number }
  initialLatLng: { lat: number; lng: number }
  onLatLngChange: (latLng: { lat: number; lng: number }) => void
}

type PopupInfo = {
  id: string
  name: string
  faculty: Faculty
  lat: number
  long: number
  _count: { bins: number }
}

export default function BinMapChartWithMarker({
  data,
  onLatLngChange,
  initialLatLng,
  latLng,
}: MapChartProps) {
  const { minLat, maxLat, minLong, maxLong } = maxBound
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)
  const [showMarkerPopUp, setShowMarkerPopUp] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)

  // 2. Setup next-themes and mounted state for hydration safety
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(function(){
    setMounted(true)
  }, [])

  useEffect(function(){
    if (!containerRef.current) return

    const observer = new ResizeObserver(function(){
      window.requestAnimationFrame(function(){
        if (mapRef.current) {
          mapRef.current.resize()
        }
      })
    })

    observer.observe(containerRef.current)

    return function(){
      observer.disconnect()
    }
  }, [])

  const onMarkerDrag = useCallback(
    (event: MarkerDragEvent) => {
      // round to 7 dp
      onLatLngChange({
        lat: parseFloat(event.lngLat.lat.toFixed(7)),
        lng: parseFloat(event.lngLat.lng.toFixed(7)),
      })
    },
    [onLatLngChange]
  )

  // 3. Dynamically set map style based on theme
  const currentMapStyle = mounted && resolvedTheme === "dark"
    ? "https://www.onemap.gov.sg/maps/json/raster/mbstyle/Night.json"
    : "https://www.onemap.gov.sg/maps/json/raster/mbstyle/Grey.json"

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <Map
        ref={mapRef}
        attributionControl={false}
        maxBounds={[minLong, minLat, maxLong, maxLat]}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: initialLatLng.lng,
          latitude: initialLatLng.lat,
          zoom: 17,
        }}
        style={{
          width: "100%",
          height: "100%", 
        }}
        mapStyle={currentMapStyle} // Apply dynamic style here
      >
        <FullscreenControl />
        <NavigationControl />
        <ScaleControl />
        <AttributionControl
          position="bottom-right"
          customAttribution={`<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20pxwidth:20px"/>&nbsp<Link href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp&copy&nbspcontributors&nbsp&#124&nbsp<Link href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>`}
        />
        
        {data
          .filter((binManager) => Number.isFinite(binManager.lat) && Number.isFinite(binManager.long))
          .map((binManager) => (
            <Marker
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                setPopupInfo({
                  id: binManager.id,
                  name: binManager.name,
                  faculty: binManager.faculty,
                  lat: binManager.lat as number,
                  long: binManager.long as number,
                  _count: binManager._count,
                })
              }}
              key={binManager.id}
              latitude={binManager.lat as number}
              longitude={binManager.long as number}
              anchor="bottom"
            >
              <IoLocationSharp
                stroke="black"
                strokeWidth={20}
                className="text-red-500"
                size={40}
              />
            </Marker>
          ))}

        {Number.isFinite(latLng?.lat) && Number.isFinite(latLng?.lng) && (
          <Marker
            longitude={latLng.lng}
            latitude={latLng.lat}
            anchor="bottom"
            draggable
            onDrag={onMarkerDrag}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setShowMarkerPopUp(true)
            }}
          >
            <IoLocationSharp
              stroke="black"
              strokeWidth={20}
              className="text-green-500"
              size={40}
            />
          </Marker>
        )}

        {popupInfo && (
          <Popup
            focusAfterOpen={false}
            anchor="top"
            longitude={Number(popupInfo.long)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
          >
            {/* Added text-slate-900 to ensure readability against default Mapbox white popup */}
            <div className="flex flex-col text-slate-900 text-sm">
              <div>
                <span className="font-bold">Name: </span>
                {popupInfo.name}
              </div>
              <div>
                <span className="font-bold">Faculty: </span>
                {popupInfo.faculty}
              </div>
              <div>
                {/* Added missing semicolon to &deg; */}
                <span className="font-bold">Latitude: </span>
                {popupInfo.lat}&deg; 
              </div>
              <div>
                <span className="font-bold">Longitude: </span>
                {popupInfo.long}&deg;
              </div>
              <div>
                <span className="font-bold">No. of bins: </span>
                {popupInfo._count.bins}
              </div>
            </div>
          </Popup>
        )}

        {showMarkerPopUp && Number.isFinite(latLng?.lat) && Number.isFinite(latLng?.lng) && (
          <Popup
            focusAfterOpen={false}
            anchor="top-left"
            longitude={latLng.lng}
            latitude={latLng.lat}
            onClose={() => setShowMarkerPopUp(false)}
          >
            <div className="flex flex-col text-slate-900 text-sm">
              <div>
                <span className="font-bold">Latitude: </span>
                {latLng.lat}&deg;
              </div>
              <div>
                <span className="font-bold">Longitude: </span>
                {latLng.lng}&deg;
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}