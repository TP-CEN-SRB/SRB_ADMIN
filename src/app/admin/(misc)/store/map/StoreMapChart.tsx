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

import { FaEdit, FaHistory } from "react-icons/fa"
import Link from "next/link"
import { IoLocationSharp } from "react-icons/io5"
import { Checkbox } from "@/components/ui/checkbox"
import MapLayer from "@/components/MapLayer"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

// Read-only overview of every store's claimed pin - mirrors the bin manager
// map (BinMapChart) so admins get the same "where is everything" view, with
// blue markers instead of red so the two entity types stay visually distinct
// on sight.
interface MapChartProps {
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

type PopupInfo = {
  id: string
  name: string
  faculty: Faculty
  lat: number
  long: number
  _count: { fulfilledRedemptions: number }
}

export default function StoreMapChart({ data }: MapChartProps) {
  const { minLat, maxLat, minLong, maxLong } = maxBound
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)
  const [showLayer, setShowLayer] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(function(){
    setMounted(true)
  }, [])

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

  const currentMapStyle = mounted && resolvedTheme === "dark"
    ? "https://www.onemap.gov.sg/maps/json/raster/mbstyle/Night.json"
    : "https://www.onemap.gov.sg/maps/json/raster/mbstyle/Grey.json"

  return (
    <div ref={containerRef} className="relative h-full w-full">
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
        mapStyle={currentMapStyle}
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

        {data.map((store) => {
          if (store.lat === undefined || store.long === undefined) return null;

          return (
            <Marker
              key={store.id}
              latitude={store.lat}
              longitude={store.long}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo({
                  id: store.id,
                  name: store.name,
                  faculty: store.faculty,
                  lat: store.lat as number,
                  long: store.long as number,
                  _count: store._count,
                });
              }}
            >
              <IoLocationSharp
                stroke="black"
                strokeWidth={20}
                className="text-blue-500"
                size={40}
              />
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            focusAfterOpen={false}
            anchor="top"
            longitude={Number(popupInfo.long)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
          >
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
                <span className="font-bold">Vouchers fulfilled: </span>
                {popupInfo._count.fulfilledRedemptions}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-slate-200">
                <Link
                  href={`/admin/store/update/${popupInfo.id}`}
                  className="flex gap-1 items-center text-blue-600 hover:underline"
                >
                  <FaEdit /> Edit
                </Link>
                <Link
                  href={`/admin/store/${popupInfo.id}`}
                  className="flex gap-1 items-center text-purple-600 hover:underline"
                >
                  <FaHistory /> View history
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
