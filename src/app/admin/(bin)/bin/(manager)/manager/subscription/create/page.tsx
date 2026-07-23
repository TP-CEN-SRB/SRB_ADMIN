import CreateSubscriptionWithManagerForm from "./CreateSubscriptionWithManagerForm"
import { getAllBinManagersForPicker } from "@/app/action/subscription"

export default async function CreateSubscriptionPage() {
  const binManagers = await getAllBinManagersForPicker()
  return (
    <div className="container mx-auto max-w-screen-xs px-4 py-6">
      <CreateSubscriptionWithManagerForm binManagers={binManagers} />
    </div>
  )
}
