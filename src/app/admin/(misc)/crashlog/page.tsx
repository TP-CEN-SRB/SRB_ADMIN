// app/admin/crashlog/page.tsx

import { Suspense } from "react"
import CrashlogDataTable from "./crashlogTable"
import { prisma } from "@/lib/db"
import { TableSkeleton } from "@/components/TableSkeleton"

const getData = async function(){
  const logs = await prisma.crashlog.findMany({
    orderBy: { createdAt: "desc" },
  })

  return logs.map((log) => ({
    id: log.id,
    message: log.message,
    createdAt: log.createdAt.toISOString(),
  }))
}

const CrashlogPage = function(){
  return (
    <Suspense fallback={<TableSkeleton columns={2} />}>
      <CrashlogTable />
    </Suspense>
  )
}

async function CrashlogTable() {
  const data = await getData()
  return <CrashlogDataTable data={data} />
}

export default CrashlogPage
