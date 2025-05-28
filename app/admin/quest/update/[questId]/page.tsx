import { getQuestById } from "@/app/action/quest";
import NotFoundPage from "@/app/not-found";
import UpdateQuestForm from "@/components/Form/QuestForms/UpdateQuestForm";
import { notFound } from "next/navigation";
import React from "react";

const UpdateQuestPage = async ({
  params,
}: {
  params: { questId: string };
}) => {
  // Fetch quest details
  const quest = await getQuestById(params.questId);

  if (!quest) {
    notFound(); // Or return <NotFoundPage />
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <UpdateQuestForm id={params.questId} quest={quest} />
    </div>
  );
};

export default UpdateQuestPage;
