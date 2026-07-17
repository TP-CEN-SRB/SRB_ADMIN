import EditSubscriptionForm from "./EditSubscriptionForm"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
  const subscription = await prisma.subscription.findUnique({
    where: { id },
  })
  if (!subscription) {
    notFound()
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <EditSubscriptionForm id={subscription.id} email={subscription.email} />
    </div>
  )
}

