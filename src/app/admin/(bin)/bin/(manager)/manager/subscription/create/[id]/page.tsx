import CreateSubscriptionForm from "./CreateSubscriptionForm"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"


export default async function CreateSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    notFound()
  }
  return (
    <div className="container mx-auto max-w-screen-xs px-4 py-6">
      <CreateSubscriptionForm id={id}/>
    </div>
  )
}
