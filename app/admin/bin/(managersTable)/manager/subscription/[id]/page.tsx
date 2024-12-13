import { getSubscriptionByUserId } from "@/app/action/subscription";
import { columns } from "@/components/Table/Subscription/columns";
import { DataTable } from "@/components/Table/Subscription/data-table";

const ViewSubscriptionPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string };
}) => {
  const { subscriptions } = await getSubscriptionByUserId(params.id);
  return (
    <DataTable
      columns={columns}
      data={subscriptions === undefined ? [] : subscriptions}
    />
  );
};
export default ViewSubscriptionPage;
