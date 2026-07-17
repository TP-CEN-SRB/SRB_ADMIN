import { getAllBinManagers } from "../action"
import CreateBinManagerScreen from "./CreateBinManagerScreen"

export default async function CreateBinManagerPage() {
  const binManagers = await getAllBinManagers()
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
