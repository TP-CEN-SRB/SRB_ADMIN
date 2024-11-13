import { AppSidebar } from "@/components/app-sidebar";
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
    <div className="bg-[var(--pastel-green)] min-h-screen">
      <SidebarProvider defaultOpen>
        <AppSidebar email={user?.email} />
        <div className="w-full mx-auto">{children}</div>
      </SidebarProvider>
    </div>
  );
}
