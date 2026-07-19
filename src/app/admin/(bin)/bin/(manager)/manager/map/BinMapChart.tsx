"use client"
import {
  engineeringGeoJson,
  businessGeoJson,
  maxBound,
  designGeoJson,
  scienceGeoJson,
  informationTechnologyGeoJson,
  humanitiesGeoJson,
} from "@/utils/map"
import { Faculty } from "@/generated/prisma"
import Map, {
  AttributionControl,
  FullscreenControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  MapRef,
} from "react-map-gl"

import { FaEdit, FaPlus } from "react-icons/fa"
import Link from "next/link"
import { IoLocationSharp } from "react-icons/io5"
import { Checkbox } from "@/components/ui/checkbox"
import MapLayer from "./MapLayer"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
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
}

type PopupInfo = {
  id: string
  name: string
  faculty: Faculty
  lat: number
  long: number
  _count: { bins: number }
}

export default function MapChart({ data }: MapChartProps) {
  const { minLat, maxLat, minLong, maxLong } = maxBound
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)
  const [showLayer, setShowLayer] = useState(true)
  const searchParams = useSearchParams()
  const Binlat = searchParams.get('lat')
  const Binlong = searchParams.get('long')

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)
  
  // 2. Setup next-themes and mounted state for hydration safety
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(function(){
    setMounted(true)
  }, [])

  // 3. Setup ResizeObserver to force map to fill space when sidebar toggles
  useEffect(function(){
    if (!containerRef.current) return;

    const observer = new ResizeObserver(function(){
      window.requestAnimationFrame(function(){
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
    });

    observer.observe(containerRef.current);

    return function(){
      observer.disconnect();
    };
  }, []);

  // 4. Dynamically set map style based on theme
  const currentMapStyle = mounted && resolvedTheme === "dark"
    ? "https://www.onemap.gov.sg/maps/json/raster/mbstyle/Night.json"
    : "https://www.onemap.gov.sg/maps/json/raster/mbstyle/Grey.json"

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* 5. Update standard bg-white to shadcn theme variables (bg-background, text-foreground, etc.) */}
      <div className="absolute z-10 top-4 left-4 bg-background text-foreground border p-2 rounded-md shadow-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={showLayer}
            onCheckedChange={() => setShowLayer(!showLayer)}
          />
          <span className="text-sm font-medium">Show school buildings</span>
        </label>
      </div>
      
      <Map
        ref={mapRef}
        attributionControl={false}
        maxBounds={[minLong, minLat, maxLong, maxLat]}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 103.9327236,
          latitude: 1.3456618,
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
        {showLayer && (
          <>
            <MapLayer
              sourceId="engine-data"
              fillId="engine-fill"
              lineId="engine-outline"
              symbolId="engine-label"
              color="#A020F0"
              data={engineeringGeoJson}
            />
            <MapLayer
              sourceId="business-data"
              fillId="business-fill"
              lineId="business-outline"
              symbolId="business-label"
              color="#FFFF00"
              data={businessGeoJson}
            />
            <MapLayer
              sourceId="design-data"
              fillId="design-fill"
              lineId="design-outline"
              symbolId="design-label"
              color="#00FFFF"
              data={designGeoJson}
            />
            <MapLayer
              sourceId="science-data"
              fillId="science-fill"
              lineId="science-outline"
              symbolId="science-label"
              color="#88E788"
              data={scienceGeoJson}
            />
            <MapLayer
              sourceId="it-data"
              fillId="it-fill"
              lineId="it-outline"
              symbolId="it-label"
              color="#0000FF"
              data={informationTechnologyGeoJson}
            />
            <MapLayer
              sourceId="humanities-data"
              fillId="humanities-fill"
              lineId="humanities-outline"
              symbolId="humanities-label"
              color="#FFA500"
              data={humanitiesGeoJson}
            />
          </>
        )}
        
        {data.map((binManager) => {
          if (binManager.lat === undefined || binManager.long === undefined) return null;

          const binLat = parseFloat(searchParams.get('lat') || '');
          const binLong = parseFloat(searchParams.get('long') || '');

          if (binManager.lat === binLat && binManager.long === binLong) return null;

          return (
            <Marker
              key={binManager.id}
              latitude={binManager.lat}
              longitude={binManager.long}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo({
                  id: binManager.id,
                  name: binManager.name,
                  faculty: binManager.faculty,
                  lat: binManager.lat as number,
                  long: binManager.long as number,
                  _count: binManager._count,
                });
              }}
            >
              <IoLocationSharp
                stroke="black"
                strokeWidth={20}
                className="text-red-500"
                size={40}
              />
            </Marker>
          );
        })}
        
        {searchParams && (
          <Marker
            latitude={Binlat ? parseFloat(Binlat) : 0}
            longitude={Binlong ? parseFloat(Binlong) : 0}
            anchor="bottom"
          >
            <IoLocationSharp
              stroke="black"
              strokeWidth={20}
              className="text-purple-500 stroke-black stroke-20 animate-bounce"
              size={40}
              style={{ background: 'transparent' }}
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
            {/* Kept text-slate-900 to ensure readability against Mapbox's default white popup background */}
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
              <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-slate-200">
                <Link
                  href={`/admin/bin/manager/update/${popupInfo.id}`}
                  className="flex gap-1 items-center text-blue-600 hover:underline"
                >
                  <FaEdit /> Edit
                </Link>
                <Link
                  href={`/admin/bin/create/${popupInfo.id}`}
                  className="flex gap-1 items-center text-green-600 hover:underline"
                >
                  <FaPlus /> Add bin
                </Link>
                <Link
                  href={`/admin/bin/manager/view/${popupInfo.id}`}
                  className="flex gap-1 items-center text-purple-600 hover:underline"
                >
                  <IoLocationSharp /> View bins
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}