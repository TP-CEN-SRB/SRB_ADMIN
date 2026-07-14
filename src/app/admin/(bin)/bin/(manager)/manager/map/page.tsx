import { getAllBins } from "@/app/action/user"
import MapChart from "./BinMapChart"

export default  async function BinManagerMap(){
  const binManagers = await getAllBins()
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
