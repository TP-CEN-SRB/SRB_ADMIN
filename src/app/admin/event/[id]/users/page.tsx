import { getUsersByEventId } from "@/app/action/event";
import ClientEventUserTable from "./eventUserTable";

const ViewEventUsersPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  const usersInEvent = await getUsersByEventId(id);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Users in Event</h1>
      <ClientEventUserTable usersInEvent={usersInEvent} />
    </div>
  );
};

export default ViewEventUsersPage;
