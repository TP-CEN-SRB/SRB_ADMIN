import EditStudentForm from "@/components/Form/StudentForms/EditStudentForm";
import prisma from "@/lib/db";
import { Faculty } from "@prisma/client";
import { notFound } from "next/navigation";
import React from "react";

const EditUserPage = async ({ params }: { params: { id: string } }) => {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      point: { select: { balance: true } },
    },
  });
  if (!user) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <EditStudentForm
        id={user.id}
        email={user.email}
        name={user.name as string}
        faculty={user.faculty as Faculty}
        points={user.point?.balance}
      />
    </div>
  );
};

export default EditUserPage;
