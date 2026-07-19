// app/admin/crashlog/page.tsx

import CrashlogDataTable from "./crashlogTable"
import { prisma } from "@/lib/db"

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

const CrashlogPage = async function(){
  const data = await getData()
  return <CrashlogDataTable data={data} />
}

export default CrashlogPage
