import React from "react";
import { getQuestTemplates } from "@/app/action/questTemplate";
import QuestTemplateTable from "./questTemplateTable";

const QuestTemplatePage = async () => {
  const templates = await getQuestTemplates();

  return (
    <div className="p-6">
      <QuestTemplateTable data={templates} />
    </div>
  );
};

export default QuestTemplatePage;
