
import { listOfBinManagersUsed } from "@/app/action/user"
import BinManagerDataTable from "./binManagerDataTable"

export default async function AllBinManagersPage(){
  const binManagers = await listOfBinManagersUsed()

  return (
    <div className="h-full w-full overflow-y-auto pb-8">
        <BinManagerDataTable data={binManagers} />
    </div>

  )
}