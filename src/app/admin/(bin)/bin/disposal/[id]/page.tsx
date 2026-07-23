import { getDisposalByBinId } from "@/app/action/disposal"
import { DisposalGallery } from "./DisposalGallery"


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
  return (
    <DisposalGallery
      material={bin?.binMaterial.name as string}
      location={bin?.user.location as string}
      binId={id}
      data={disposals === undefined ? [] : disposals}
      count={disposalCount === undefined ? 0 : disposalCount}
    />
  )
}