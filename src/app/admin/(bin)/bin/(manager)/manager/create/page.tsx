import { getAllBins } from "@/app/action/user"
import CreateBinManagerScreen from "./CreateBinManagerScreen"

export default async function CreateBinManagerPage() {
  const binManagers = await getAllBins()
  return (
    <CreateBinManagerScreen
      data={binManagers.map((user) => ({
        ...user,
        lat: user.lat?? undefined,
        long: user.long?? undefined,
      }))}
    />
  )
}
