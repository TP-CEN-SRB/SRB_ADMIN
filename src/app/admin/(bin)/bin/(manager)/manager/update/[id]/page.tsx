import { getAllBinManagers } from "../../action"
import UpdateBinManagerScreen from "./UpdateBinManagerScreen"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"


export default async function UpdateBinManagersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 
  const [binUser, binManagers] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        faculty: true,
        lat: true,
        long: true,
      },
    }),
    getAllBinManagers(),
  ])
  if (!binUser) {
    notFound()
  }
  const filteredBinManagers = binManagers.filter(
    (manager) => manager.id !== binUser.id
  )
  return (
    <UpdateBinManagerScreen
      binManager={{
        ...binUser,
        lat: binUser.lat?? undefined,
        long: binUser.long?? undefined,
      }}
      data={filteredBinManagers.map((user) => ({
        ...user,
        lat: user.lat?? undefined,
        long: user.long?? undefined,
      }))}
    />
  )
}
