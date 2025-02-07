import Card from "@/components/Card/Card";
import UserProfileMore from "@/components/Dropdown/UserProfileMore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import prisma from "@/lib/db";
import { getNameInitials } from "@/utils/getNameInitials";
import { notFound } from "next/navigation";
import React from "react";

const UserPage = async ({ params }: { params: { id: string } }) => {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { disposals: true, redemptions: true } },
      point: { select: { balance: true } },
    },
  });
  if (!user) {
    notFound();
  }
  return (
    <div className="p-4 space-y-4">
      <Card isAdmin>
        <div className="flex items-center gap-x-10">
          <Avatar className="border border-slate-800 w-24 h-24 text-3xl font-bold">
            <AvatarFallback>
              {getNameInitials(user.name as string)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-slate-800">{user.name}</h1>
            <p className="text-slate-600 mt-1 text-sm">{user.faculty}</p>
          </div>
        </div>
      </Card>
      <Card isAdmin>
        <div className="flex flex-wrap justify-between items-center">
          <h1 className="text-2xl md:text-4xl text-left text-slate-800">
            Profile Information
          </h1>
          <UserProfileMore id={user.id} />
        </div>
        <div className="mt-5">
          <div className="flex md:flex-row flex-col md:gap-0 gap-6">
            <div className="flex flex-col flex-1 flex-shrink flex-basis-[200px] gap-6">
              <div>
                <p className="text-slate-600">Name</p>
                <p className="text-slate-700 font-bold text-xl">{user.name}</p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
                <p className="text-slate-700 font-bold text-xl">{user.email}</p>
              </div>
              {user.email.endsWith("@student.tp.edu.sg") && (
                <div>
                  <p className="text-slate-600">Admin Number</p>
                  <p className="text-slate-700 font-bold text-xl">
                    {user.email.split("@")[0].toUpperCase()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-600">Faculty</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user.faculty}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Point Balance</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user.point?.balance}
                </p>
              </div>
            </div>

            <div className="flex flex-col flex-1 flex-shrink flex-basis-[200px] gap-6">
              <div>
                <p className="text-slate-600">Account created</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Account verified</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user.emailVerified
                    ? user.emailVerified?.toLocaleDateString()
                    : "Not available"}
                  {}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Last updated</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Disposals made</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user._count.disposals}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Redemptions made</p>
                <p className="text-slate-700 font-bold text-xl">
                  {user._count.redemptions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserPage;
