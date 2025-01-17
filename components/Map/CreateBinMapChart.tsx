"use client";
import { maxBound } from "@/utils/map";
import { Faculty } from "@prisma/client";
import Map, {
  AttributionControl,
  FullscreenControl,
  LngLat,
  Marker,
  MarkerDragEvent,
  NavigationControl,
  Popup,
  ScaleControl,
} from "react-map-gl";
import { useCallback, useState } from "react";
import { IoLocationSharp } from "react-icons/io5";

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
  latLng: { lat: number; lng: number };
  onLatLngChange: (latLng: { lat: number; lng: number }) => void;
}
type PopupInfo = {
  id: string;
  name: string;
  faculty: Faculty;
  lat: number;
  long: number;
  _count: { bins: number };
};
export default function CreateBinMapChart({
  data,
  onLatLngChange,
  latLng,
}: MapChartProps) {
  const { minLat, maxLat, minLong, maxLong } = maxBound;
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [marker, setMarker] = useState(latLng);

  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    console.log(
      "Starting coordinates: ",
      event.lngLat.lat + " " + event.lngLat.lng
    );
  }, []);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    setMarker({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
    });
    // round to 7 dp
    onLatLngChange({
      lat: parseFloat(event.lngLat.lat.toFixed(7)),
      lng: parseFloat(event.lngLat.lng.toFixed(7)),
    });
  }, []);

  const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    console.log(
      "Ending coordinates: ",
      event.lngLat.lat + " " + event.lngLat.lng
    );
  }, []);
  return (
    <div className="relative h-full w-full">
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
          maxHeight: "100%",
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
        <Marker
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="bottom"
          draggable
          onDragStart={onMarkerDragStart}
          onDrag={onMarkerDrag}
          onDragEnd={onMarkerDragEnd}
        >
          <IoLocationSharp
            stroke="black"
            strokeWidth={20}
            className="text-green-500"
            size={40}
          />
        </Marker>
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
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
