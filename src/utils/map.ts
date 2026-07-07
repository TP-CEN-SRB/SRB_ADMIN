import type { FeatureCollection } from "geojson"
export const maxBound = {
  minLat: 1.34162,
  maxLat: 1.35,
  minLong: 103.92431,
  maxLong: 103.93916,
}

const engineeringGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      properties: { name: "ENG" },
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9322128, 1.3459007],
            [103.9316067, 1.3456615],
            [103.9315441, 1.3458443],
            [103.9319302, 1.3460119],
            [103.9316167, 1.3461421],
            [103.931093, 1.34593735],
            [103.9310259, 1.3461083],
            [103.930357, 1.3456839],
            [103.9299499, 1.3466897],
            [103.9303541, 1.3468525],
            [103.9295747, 1.3473321],
            [103.9296271, 1.3474455],
            [103.9299099, 1.3473221],
            [103.9300317, 1.3475657],
            [103.9302308, 1.3474499],
            [103.9301179, 1.3472449],
            [103.9301892, 1.3472033],
            [103.9301952, 1.3472063],
            [103.9302903, 1.3473994],
            [103.9323813, 1.3462636],
            [103.9322128, 1.3459007],
          ],
        ],
      },
    },
  ],
}
const businessGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      properties: { name: "BUS" },
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9330962, 1.3451674],
            [103.933594, 1.343884],
            [103.9339571, 1.3440299],
            [103.9341106, 1.3436184],
            [103.9336587, 1.3434357],
            [103.9336296, 1.3435051],
            [103.9334068, 1.3434115],
            [103.9323492, 1.3438443],
            [103.9324784, 1.3441413],
            [103.9327497, 1.3440477],
            [103.9330663, 1.3441849],
            [103.9327401, 1.3450034],
            [103.9330962, 1.3451674],
          ],
        ],
      },
    },
  ],
}
const designGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      properties: { name: "DES" },
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9315751, 1.3456349],
            [103.9309864, 1.3453711],
            [103.9308479, 1.3457192],
            [103.9315121, 1.3460062],
            [103.9315647, 1.3458772],
            [103.9314954, 1.3458491],
            [103.9315751, 1.3456349],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "DES" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9320979, 1.3456319],
            [103.9311299, 1.3452249],
            [103.9313075, 1.3448028],
            [103.9316394, 1.3449396],
            [103.9316032, 1.3450168],
            [103.932237, 1.3452916],
            [103.9320979, 1.3456319],
          ],
        ],
      },
    },
  ],
}
const scienceGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      properties: { name: "ASC" },
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9332456, 1.3454578],
            [103.9336729, 1.3444476],
            [103.9340408, 1.3446036],
            [103.9338104, 1.345131],
            [103.9339665, 1.3457401],
            [103.9334128, 1.3458961],
            [103.9332456, 1.3454578],
          ],
        ],
      },
    },
  ],
}
const informationTechnologyGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      properties: { name: "IIT" },
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9339814, 1.3457253],
            [103.9345413, 1.3455468],
            [103.934347, 1.3447932],
            [103.9341061, 1.3446819],
            [103.9338626, 1.3452283],
            [103.9339814, 1.3457253],
          ],
        ],
      },
    },
  ],
}
const humanitiesGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      properties: { name: "HSS" },
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [103.9346138, 1.3455493],
            [103.9355956, 1.3452593],
            [103.9354428, 1.3446482],
            [103.9344351, 1.344946],
            [103.9346138, 1.3455493],
          ],
        ],
      },
    },
  ],
}
export {
  engineeringGeoJson,
  businessGeoJson,
  designGeoJson,
  scienceGeoJson,
  informationTechnologyGeoJson,
  humanitiesGeoJson,
}
