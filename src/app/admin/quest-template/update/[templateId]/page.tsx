import { getQuestTemplateById } from "@/app/action/questTemplate";
import UpdateQuestTemplateForm from "@/components/Form/QuestForms/UpdateQuestTemplateForm";
import { notFound } from "next/navigation";

export default async function UpdateQuestTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params; 
  const template = await getQuestTemplateById(templateId);

  if (!template) return notFound();

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <UpdateQuestTemplateForm id={templateId} template={template} />
    </div>
  );
}
