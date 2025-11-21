import { AppSidebar } from "@/components/app-sidebar";
import { MobileAppSidebar } from "@/components/mobile-app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import { redirect } from "next/navigation"; // ✅ import redirect helper
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔹 Step 1: Get the currently logged-in user
  const sessionUser = await getSessionUser();

  // 🔹 Step 2: Redirect if not authenticated
  if (!sessionUser?.id) {
    redirect("/login"); // 👈 redirect to your login page
  }

  // 🔹 Step 3: Fetch the full user record
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  // Optional: if user not found (e.g. deleted in DB), redirect again
  if (!user) {
    redirect("/login");
  }

  // 🔹 Step 4: Return the admin layout
  return (
    <div>
      <MobileAppSidebar />
      <SidebarProvider defaultOpen>
        <AppSidebar email={user.email} />
        <div className="w-full mx-auto bg-[#f0f1f4] overflow-x-auto">
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
