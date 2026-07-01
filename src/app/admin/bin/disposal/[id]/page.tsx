import { getDisposalByBinId } from "@/app/action/disposal";
import { DataTable } from "@/components/Table/Disposal/data-table";
import { columns } from "@/components/Table/Disposal/columns";
import React from "react";

const ViewBinDisposalPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string };
}) => {
  const { id } = await params; 
  const page = Number(searchParams?.page) || 1;
  const sortOrder = searchParams.sortOrder;
  const sortItem = searchParams.sortItem;
  const { disposalCount, disposals, bin } = await getDisposalByBinId(
    id,
    page,
    sortOrder,
    sortItem
  );
  return (
    <DataTable
      material={bin?.binMaterial.name as string}
      location={bin?.user.location as string}
      binId={id}
      columns={columns}
      data={disposals === undefined ? [] : disposals}
      count={disposalCount === undefined ? 0 : disposalCount}
    />
  );
};

export default ViewBinDisposalPage;
