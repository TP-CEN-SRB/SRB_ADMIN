import { columns } from "@/components/Table/Student/columns";
import { DataTable } from "@/components/Table/Student/data-table";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

const ViewStudentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const page = Number(searchParams?.page) || 1;
  if (page < 1) notFound();
  const query = searchParams.query
    ? decodeURIComponent(searchParams.query)
    : null;
  const sortItem = searchParams.sortItem as "disposal" | "point" | undefined;
  const sortOrder = searchParams.sortOrder as "asc" | "desc" | undefined;
  let orderBy;

  if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
    orderBy = { createdAt: "desc" as const };
  } else if (sortItem && sortOrder) {
    if (sortItem === "disposal") {
      orderBy = { disposals: { _count: sortOrder } };
    } else if (sortItem === "point") {
      orderBy = { point: { balance: sortOrder } };
    }
  } else {
    orderBy = { createdAt: "desc" as const };
  }
  const [studentCount, students] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        OR: query
          ? [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
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
      orderBy: orderBy,
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
  if (!students) {
    return <h1>Not found</h1>;
  }
  return <DataTable columns={columns} data={students} count={studentCount} />;
};
export default ViewStudentPage;
