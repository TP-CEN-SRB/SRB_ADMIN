import EditAdminForm from "@/components/FormLogic/AdminUserForms/EditAdminForm";
import { prisma } from "@/lib/db";
import { authClient } from "@/lib/auth-client";
import { Faculty } from "@/generated/prisma";
import { notFound } from "next/navigation";

const EditProfilePage = async () => {
  const { data: session } = await authClient.getSession()
  const sessionUser = session?.user;
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
