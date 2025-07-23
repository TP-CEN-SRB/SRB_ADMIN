import { getUsersByEventId } from "@/app/action/event";
import ClientEventUserTable from "./eventUserTable";

const ViewEventUsersPage = async ({ params }: { params: { id: string } }) => {
  const usersInEvent = await getUsersByEventId(params.id);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Users in Event</h1>
      <ClientEventUserTable usersInEvent={usersInEvent} />
    </div>
  );
};

export default ViewEventUsersPage;
