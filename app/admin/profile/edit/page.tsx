import EditAdminForm from "@/components/Form/AdminUserForms/EditAdminForm";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import { Faculty } from "@prisma/client";
import { notFound } from "next/navigation";
import React from "react";

const EditProfilePage = async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    notFound();
  }
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <EditAdminForm
        email={user.email}
        name={user.name as string}
        faculty={user.faculty as Faculty}
      />
    </div>
  );
};

export default EditProfilePage;
