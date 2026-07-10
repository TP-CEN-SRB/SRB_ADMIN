
import { columns } from "./columns"
import { getAllBinsWithUserAndMaterial } from "@/app/action/bin"
import { DataTable } from "./data-table"

export default async function AllBinsPage() {
  const { bins, materials } = await getAllBinsWithUserAndMaterial()
  return(
    <div className="h-full w-full overflow-y-auto pb-8">
      <DataTable columns={columns} data={bins} materials={materials} />
    </div>
  ) 
}
