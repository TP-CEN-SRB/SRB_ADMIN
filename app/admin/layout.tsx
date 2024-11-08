import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <div className="bg-[var(--pastel-green)] min-h-screen">
      <SidebarProvider defaultOpen>
        <AppSidebar email={user?.email} />
        <div className="w-full">{children}</div>
      </SidebarProvider>
    </div>
  );
}
