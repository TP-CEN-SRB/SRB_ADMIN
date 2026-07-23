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
    <div className="container mx-auto max-w-screen-xs px-4 py-6">
      <EditSubscriptionForm id={subscription.id} email={subscription.email} />
    </div>
  )
}

