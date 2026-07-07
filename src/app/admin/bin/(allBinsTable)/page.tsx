
import { columns } from "./columns"
import { getAllBinsWithUserAndMaterial } from "@/app/action/bin"
import { DataTable } from "./data-table"

export default async function AllBinsPage() {
  const { bins, materials } = await getAllBinsWithUserAndMaterial()
  return <DataTable columns={columns} data={bins} materials={materials} />
}
