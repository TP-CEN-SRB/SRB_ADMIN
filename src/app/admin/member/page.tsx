import { getAllStudentUsers } from "@/app/action/user"
import { columns } from "@/components/Table/Student/columns"
import { DataTable } from "@/components/Table/Student/data-table"

const ViewStudentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string }
}) => {
  const page = Number(searchParams?.page) || 1
  const query = searchParams.query
    ? decodeURIComponent(searchParams.query)
    : null
  const sortItem = searchParams.sortItem
  const sortOrder = searchParams.sortOrder
  const emailType = searchParams.emailType
    ? decodeURIComponent(searchParams.emailType)
    : null
  const faculty = searchParams.faculty
    ? decodeURIComponent(searchParams.faculty)
    : null
  const { studentCount, students } = await getAllStudentUsers(
    page,
    query,
    sortOrder,
    sortItem,
    emailType,
    faculty
  )
  return (
    <div className="h-full w-full overflow-y-auto pb-8">
      <DataTable columns={columns} data={students === undefined ? [] : (students as any[])} count={studentCount === undefined ? 0 : studentCount}/>
    </div>

  )
}
export default ViewStudentPage
