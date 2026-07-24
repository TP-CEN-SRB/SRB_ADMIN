import { getDisposalByBinId, getBinImageSnapshot } from "@/app/action/disposal"
import { DataTable } from "./data-table"
import { columns } from "./columns"


export default async function ViewBinDisposalPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: { [key: string]: string }
}){
  const { id } = await params
  const page = Number(searchParams?.page) || 1
  const sortOrder = searchParams.sortOrder
  const sortItem = searchParams.sortItem
  const { disposalCount, disposals, bin } = await getDisposalByBinId(
    id,
    page,
    sortOrder,
    sortItem
  )
  const imageSnapshot = await getBinImageSnapshot(id)
  const imageCount = "count" in imageSnapshot ? imageSnapshot.count : 0
  return (
    <DataTable
      material={bin?.binMaterial.name as string}
      location={bin?.user.location as string}
      binId={id}
      columns={columns}
      data={disposals === undefined ? [] : disposals}
      count={disposalCount === undefined ? 0 : disposalCount}
      imageCount={imageCount}
    />
  )
}