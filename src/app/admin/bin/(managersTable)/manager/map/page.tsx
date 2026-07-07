import { getAllBinUsers } from "@/app/action/user"
import MapChart from "@/components/Map/BinMapChart"

export default  async function BinManagerMap(){
  const binManagers = await getAllBinUsers()
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
