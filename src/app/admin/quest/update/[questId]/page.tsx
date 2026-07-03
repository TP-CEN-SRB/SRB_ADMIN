import { getQuestById } from "@/app/action/quest";
import NotFoundPage from "@/app/not-found";
import UpdateQuestForm from "@/components/FormLogic/QuestForms/UpdateQuestForm";
import { notFound } from "next/navigation";
import React from "react";

const UpdateQuestPage = async ({
  params,
}: {
  params: Promise<{ questId: string }>;
}) => {
  // Fetch quest details
  const { questId } = await params; 
  const quest = await getQuestById(questId);

  if (!quest) {
    notFound(); 
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <UpdateQuestForm id={questId} quest={quest} />
    </div>
  );
};

export default UpdateQuestPage;
