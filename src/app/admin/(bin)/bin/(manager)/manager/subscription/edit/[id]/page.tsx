import { Suspense } from "react"
import EditSubscriptionForm from "./EditSubscriptionForm"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="container mx-auto max-w-screen-xs px-4 py-6">
      <Suspense fallback={<FormSkeleton fields={1} />}>
        <EditSubscriptionSection params={params} />
      </Suspense>
    </div>
  )
}

async function EditSubscriptionSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subscription = await prisma.subscription.findUnique({
    where: { id },
  })
  if (!subscription) {
    notFound()
  }
  return <EditSubscriptionForm id={subscription.id} email={subscription.email} />
}
