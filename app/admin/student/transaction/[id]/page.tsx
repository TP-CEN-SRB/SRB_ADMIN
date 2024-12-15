import { getTransactionByUserId } from "@/app/action/transaction";
import { columns } from "@/components/Table/Transaction/columns";
import { DataTable } from "@/components/Table/Transaction/data-table";
import React from "react";

const ViewStudentTransactionPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string };
}) => {
  const page = Number(searchParams?.page) || 1;
  const sortOrder = searchParams.sortOrder;
  const transactionType = searchParams.transactionType
    ? decodeURIComponent(searchParams.transactionType)
    : null;
  const { transactionCount, transactions } = await getTransactionByUserId(
    params.id,
    page,
    sortOrder,
    transactionType
  );

  return (
    <div>
      <DataTable
        userId={params.id}
        columns={columns}
        data={transactions === undefined ? [] : transactions}
        count={transactionCount === undefined ? 0 : transactionCount}
      />
    </div>
  );
};

export default ViewStudentTransactionPage;
