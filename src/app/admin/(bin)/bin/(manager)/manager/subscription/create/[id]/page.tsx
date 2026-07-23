import { Suspense } from "react"
import CreateSubscriptionForm from "./CreateSubscriptionForm"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { FormSkeleton } from "@/components/FormSkeleton"

export default function CreateSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="container mx-auto max-w-screen-xs px-4 py-6">
      <Suspense fallback={<FormSkeleton fields={1} />}>
        <CreateSubscriptionSection params={params} />
      </Suspense>
    </div>
  )
}

async function CreateSubscriptionSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    notFound()
  }
  return <CreateSubscriptionForm id={id}/>
}
