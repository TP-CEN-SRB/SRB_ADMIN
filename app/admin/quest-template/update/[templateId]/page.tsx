import { getQuestTemplateById } from "@/app/action/questTemplate";
import UpdateQuestTemplateForm from "@/components/Form/QuestForms/UpdateQuestTemplateForm";
import { notFound } from "next/navigation";

export default async function UpdateQuestTemplatePage({
  params,
}: {
  params: { templateId: string };
}) {
  const template = await getQuestTemplateById(params.templateId);

  if (!template) return notFound();

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <UpdateQuestTemplateForm id={params.templateId} template={template} />
    </div>
  );
}
