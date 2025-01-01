import { getDisposalByBinId } from "@/app/action/disposal";
import { DataTable } from "@/components/Table/Disposal/data-table";
import { columns } from "@/components/Table/Disposal/columns";
import React from "react";

const ViewBinDisposalPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string };
}) => {
  const page = Number(searchParams?.page) || 1;
  const sortOrder = searchParams.sortOrder;
  const sortItem = searchParams.sortItem;
  const { disposalCount, disposals } = await getDisposalByBinId(
    params.id,
    page,
    sortOrder,
    sortItem
  );
  return (
    <DataTable
      binId={params.id}
      columns={columns}
      data={disposals === undefined ? [] : disposals}
      count={disposalCount === undefined ? 0 : disposalCount}
    />
  );
};

export default ViewBinDisposalPage;
