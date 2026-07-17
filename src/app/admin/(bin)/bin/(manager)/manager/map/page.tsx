import { getAllBinManagers } from "../action"
import MapChart from "./BinMapChart"

export default  async function BinManagerMap(){
  const binManagers = await getAllBinManagers()
  return (
    <MapChart
      data={binManagers.map((user) => ({
        ...user,
        lat: user.lat?? undefined,
        long: user.long?? undefined,
      }))}
    />
  )
}
