import { getAllStudentUsers } from "@/app/action/user";
import { columns } from "@/components/Table/Student/columns";
import { DataTable } from "@/components/Table/Student/data-table";

const ViewStudentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const page = Number(searchParams?.page) || 1;
  const query = searchParams.query
    ? decodeURIComponent(searchParams.query)
    : null;
  const sortItem = searchParams.sortItem;
  const sortOrder = searchParams.sortOrder;
  const { studentCount, students } = await getAllStudentUsers(
    page,
    query,
    sortOrder,
    sortItem
  );
  return <DataTable columns={columns} data={students} count={studentCount} />;
};
export default ViewStudentPage;
