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
import { getQuestById } from "@/app/action/quest"
import UpdateQuestForm from "@/components/FormLogic/(Quest)/UpdateQuestForm"
import { notFound } from "next/navigation"

const UpdateQuestPage = async ({
  params,
}: {
  params: Promise<{ questId: string }>
}) => {
  // Fetch quest details
  const { questId } = await params
  const quest = await getQuestById(questId)

  if (!quest) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px] h-full overflow-y-auto">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Edit Quest</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/activity/quest">
            <Undo2 className="mr-2 size-4" />
            Cancel & Return
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Quest Details</CardTitle>
            <CardDescription>Update this quest&apos;s details.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateQuestForm id={questId} quest={quest} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UpdateQuestPage
