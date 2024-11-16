import { columns } from "@/components/Table/Student/columns";
import { DataTable } from "@/components/Table/Student/data-table";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

const ViewStudentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const page = parseInt(searchParams.page) || 1;
  if (page < 1) notFound();
  const query = searchParams.query;
  const [studentCount, students] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        email: query ? { contains: query, mode: "insensitive" } : undefined,
      },
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",

        OR: query
          ? [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
      },
      take: 10,
      skip: (page - 1) * 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        point: { select: { balance: true } },
        _count: { select: { disposals: true } },
      },
    }),
  ]);
  return <DataTable columns={columns} data={students} count={studentCount} />;
};
export default ViewStudentPage;
