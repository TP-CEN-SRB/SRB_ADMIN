import EditStudentForm from "@/components/FormLogic/StudentForms/EditStudentForm";
import { prisma } from "@/lib/db";
import { Faculty } from "@/generated/prisma";
import { notFound } from "next/navigation";
import React from "react";

const EditUserPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  const user = await prisma.user.findUnique({
    where: { id },
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
