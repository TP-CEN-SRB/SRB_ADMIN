import { getUsersByQuestId } from "@/app/action/quest";
import ClientQuestUserTable from "./questUserTable";

const ViewQuestUsersPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 

  const usersInQuest = await getUsersByQuestId(id);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Users in Quest</h1>
      <ClientQuestUserTable usersInQuest={usersInQuest} />
    </div>
  );
};

export default ViewQuestUsersPage;
