import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";
import { getNameInitials } from "@/utils/getNameInitials";
import AdminProfileMore from "@/components/Dropdown/AdminProfileMore";

const AdminProfilePage = async () => {
  const sessionUser = await getSessionUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser?.id } });

  return (
    <div className="p-4 space-y-4">
      <Card isAdmin>
        <div className="flex items-center gap-x-10">
          <Avatar className="border border-slate-800 w-24 h-24 text-3xl font-bold">
            <AvatarFallback>
              {getNameInitials(user?.name as string)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-slate-800">{user?.name}</h1>
            <p className="text-slate-600 mt-1 text-sm">{user?.faculty}</p>
          </div>
        </div>
      </Card>
      <Card isAdmin>
        <div className="flex justify-between items-center">
          <CardHeader>Profile Information</CardHeader>
          <AdminProfileMore email={user?.email as string} />
        </div>
        <div className="mt-5">
          <div className="flex md:flex-row flex-col md:gap-0 gap-6">
            <div className="flex flex-col flex-1 flex-shrink flex-basis-[200px] gap-6">
              <div>
                <p className="text-slate-600">Name</p>
                <p className="text-slate-700 font-bold text-xl">{user?.name}</p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Faculty</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user?.faculty}
                </p>
              </div>
            </div>
            <div className="flex flex-col flex-1 flex-shrink flex-basis-[200px] gap-6">
              <div>
                <p className="text-slate-600">Account created</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user?.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Account verified</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user?.emailVerified?.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Last updated</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user?.updatedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProfilePage;
