import { Suspense } from "react"
import { getAllBinManagers } from "../action"
import CreateBinManagerScreen from "./CreateBinManagerScreen"
import { FormSkeleton } from "@/components/FormSkeleton"

export default function CreateBinManagerPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={5} />}>
      <CreateBinManagerSection />
    </Suspense>
  )
}

async function CreateBinManagerSection() {
  const binManagers = await getAllBinManagers()
  return (
    <CreateBinManagerScreen
      data={binManagers.map((user) => ({
        ...user,
        lat: user.lat?? undefined,
        long: user.long?? undefined,
      }))}
    />
  )
}
