import Link from "next/link"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getQuestTemplateById } from "@/app/action/questTemplate"
import UpdateQuestTemplateForm from "@/components/FormLogic/(Quest)/UpdateQuestTemplateForm"
import { notFound } from "next/navigation"

export default async function UpdateQuestTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params
  const template = await getQuestTemplateById(templateId)

  if (!template) return notFound()

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Quest Template</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/activity/quest-template">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Update this quest template.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateQuestTemplateForm id={templateId} template={template} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
