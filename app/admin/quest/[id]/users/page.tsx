import { getUsersByQuestId } from "@/app/action/quest";
import ClientQuestUserTable from "./questUserTable";

const ViewQuestUsersPage = async ({ params }: { params: { id: string } }) => {
  const usersInQuest = await getUsersByQuestId(params.id);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Users in Quest</h1>
      <ClientQuestUserTable usersInQuest={usersInQuest} />
    </div>
  );
};

export default ViewQuestUsersPage;
