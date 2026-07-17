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
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <CreateSubscriptionForm id={id}/>
    </div>
  )
}
