import { Suspense } from "react"
import CreateSubscriptionWithManagerForm from "./CreateSubscriptionWithManagerForm"
import { getAllBinManagersForPicker } from "@/app/action/subscription"
import { FormSkeleton } from "@/components/FormSkeleton"

export default function CreateSubscriptionPage() {
  return (
    <div className="container mx-auto max-w-screen-xs px-4 py-6">
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <CreateSubscriptionSection />
      </Suspense>
    </div>
  )
}

async function CreateSubscriptionSection() {
  const binManagers = await getAllBinManagersForPicker()
  return <CreateSubscriptionWithManagerForm binManagers={binManagers} />
}
