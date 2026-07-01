import { getSubscriptionByUserId } from "@/app/action/subscription";
import { columns } from "@/components/Table/Subscription/columns";
import { DataTable } from "@/components/Table/Subscription/data-table";

const ViewSubscriptionPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  const { subscriptions } = await getSubscriptionByUserId(id);
  return (
    <DataTable
      columns={columns}
      data={subscriptions === undefined ? [] : subscriptions}
    />
  );
};
export default ViewSubscriptionPage;
