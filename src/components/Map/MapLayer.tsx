
import { Layer, Source } from "react-map-gl"
import type { FeatureCollection } from "geojson"

interface LayerProps {
  sourceId: string
  fillId: string
  lineId: string
  symbolId: string
  data: FeatureCollection
  color: string
}
const MapLayer = ({
  sourceId,
  fillId,
  lineId,
  symbolId,
  data,
  color,
}: LayerProps) => {
  return (
    <Source id={sourceId} type="geojson" data={data}>
      <Layer
        id={fillId}
        type="fill"
        paint={{
          "fill-color": color,
          "fill-opacity": 0.5,
        }}
      />
      <Layer
        id={lineId}
        type="line"
        paint={{
          "line-color": "#222222",
          "line-width": 2,
        }}
      />
      <Layer
        id={symbolId}
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            12, // zoom 10, size 12
            16,
            14,
          ],
          "text-anchor": "center",
          "text-font": ["Open Sans Bold"],
        }}
        paint={{
          "text-color": "#000",
        }}
      />
    </Source>
  )
}

export default MapLayer
