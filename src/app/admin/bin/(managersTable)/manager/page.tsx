
import { listOfBinManagersUsed } from "@/app/action/user"
import BinManagerDataTable from "./binManagerDataTable"

export default async function AllBinManagersPage(){
  const binManagers = await listOfBinManagersUsed()

  return (
  <BinManagerDataTable data={binManagers} />
  )
}