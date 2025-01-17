import { AppSidebar } from "@/components/app-sidebar";
import { MobileAppSidebar } from "@/components/mobile-app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser?.id } });

  return (
    <div>
      <MobileAppSidebar />
      <SidebarProvider defaultOpen>
        <AppSidebar email={user?.email} />
        <div className="w-full mx-auto bg-[#f0f1f4] overflow-x-auto">
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
