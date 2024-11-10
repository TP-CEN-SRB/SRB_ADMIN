import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaEdit } from "react-icons/fa";
import { MdLockReset, MdMoreVert } from "react-icons/md";
import { IoIosMail } from "react-icons/io";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";
import Link from "next/link";

const AdminProfilePage = async () => {
  const sessionUser = await getSessionUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser?.id } });

  return (
    <div className="p-4 space-y-4">
      <Card>
        <div className="flex items-center gap-x-10">
          <Avatar className="border border-slate-800 w-24 h-24 text-3xl font-bold">
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-slate-800">{user?.name}</h1>
            <p className="text-slate-600 mt-1 text-sm">{user?.faculty}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center">
          <CardHeader>Profile Information</CardHeader>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full border border-black text-xl p-2">
              <MdMoreVert />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <Link href="/admin/profile/edit">
                <DropdownMenuItem className="hover:!bg-[#f5f2b3] cursor-pointer">
                  <FaEdit />
                  <span>Edit profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="hover:!bg-[#f5f2b3] cursor-pointer">
                <IoIosMail />
                <span>Change email</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:!bg-[#f5f2b3] cursor-pointer">
                <MdLockReset />
                <span>Reset password</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-5">
          <div className="flex flex-wrap">
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
