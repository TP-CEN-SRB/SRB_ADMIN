import { getAllBinUsers } from "@/app/action/user"
import CreateBinManagerScreen from "@/components/Screen/CreateBinManagerScreen"

export default async function CreateBinManagerPage() {
  const binManagers = await getAllBinUsers()
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
