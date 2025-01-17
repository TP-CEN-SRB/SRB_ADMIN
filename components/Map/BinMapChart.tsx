"use client";
import { engineeringGeoJson, businessGeoJson, maxBound } from "@/utils/map";
import { Faculty } from "@prisma/client";
import Map, {
  AttributionControl,
  FullscreenControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
} from "react-map-gl";
import { useState } from "react";
import { FaEdit, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { IoLocationSharp } from "react-icons/io5";
import { Checkbox } from "@/components/ui/checkbox";
import MapLayer from "@/components/Map/MapLayer";

interface MapChartProps {
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
type PopupInfo = {
  id: string;
  name: string;
  faculty: Faculty;
  lat: number;
  long: number;
  _count: { bins: number };
};
export default function MapChart({ data }: MapChartProps) {
  const { minLat, maxLat, minLong, maxLong } = maxBound;
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [showLayer, setShowLayer] = useState(true);
  return (
    <div className="relative h-full w-full">
      <div className="absolute z-10 top-4 left-4 bg-white p-2 rounded shadow-sm">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={showLayer}
            onCheckedChange={() => setShowLayer(!showLayer)}
          />
          Show school buildings
        </label>
      </div>
      <Map
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
        mapStyle="https://www.onemap.gov.sg/maps/json/raster/mbstyle/Grey.json"
      >
        <FullscreenControl />
        <NavigationControl />
        <ScaleControl />
        <AttributionControl
          position="bottom-right"
          customAttribution={`<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>`}
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
          </>
        )}
        {data.map((binManager) => (
          <Marker
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
        {popupInfo && (
          <Popup
            focusAfterOpen={false}
            anchor="top"
            longitude={Number(popupInfo.long)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
          >
            <div className="flex flex-col">
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
              <div className="flex items-center gap-1 flex-wrap mt-1">
                <Link
                  href={`/admin/bin/manager/update/${popupInfo.id}`}
                  className="flex gap-1 items-center text-blue-600 hover:underline text-sm"
                >
                  <FaEdit /> Edit
                </Link>
                <Link
                  href={`/admin/bin/create/${popupInfo.id}`}
                  className="flex gap-1 items-center text-green-600 hover:underline text-sm"
                >
                  <FaPlus /> Add bin
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
