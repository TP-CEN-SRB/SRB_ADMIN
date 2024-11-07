"use client";

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsFillBarChartFill } from "react-icons/bs";
import { enableNav } from "@/utils/enableNav";
import { usePathname } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { FaBell, FaTrash, FaUser } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { logout } from "@/app/action/user";
import { PiSignOutBold } from "react-icons/pi";
import { FaChevronRight } from "react-icons/fa";
import { GiPresent } from "react-icons/gi";
import Image from "next/image";

const items = [
  {
    title: "Home",
    url: "/admin",
    icon: BsFillBarChartFill,
  },
  {
    title: "Bins",
    url: "/admin/bin/all",
    icon: FaTrash,
  },
  {
    title: "Users",
    url: "/admin/user",
    icon: FaUser,
  },
  {
    title: "Rewards",
    url: "/admin/reward",
    icon: GiPresent,
  },
  {
    title: "Settings",
    url: "#",
    icon: IoSettings,
  },
];

export function AppSidebar({ email }: { email: string }) {
  const path = usePathname();
  return (
    enableNav.some((route) => path.startsWith(route)) && (
      <Sidebar>
        <SidebarContent>
          <SidebarMenu className="p-4">
            <Image
              src="/temasekPolyBanner.png"
              alt="Temasek Poly"
              width="300"
              height="300"
            />
          </SidebarMenu>
          <SidebarHeader>
            <SidebarMenu>
              {items.map((project) => (
                <SidebarMenuItem key={project.title}>
                  <SidebarMenuButton asChild>
                    <a href={project.url}>
                      <project.icon />
                      <span>{project.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarHeader>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <CgProfile /> {email}
                    <FaChevronRight className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" sideOffset={10}>
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:!bg-[#f5f2b3]">
                    <FaUser />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:!bg-[#f5f2b3]">
                    <FaBell />
                    Notification
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:!bg-[#f5f2b3]">
                    <form action={logout}>
                      <button
                        className="flex items-center gap-x-2"
                        type="submit"
                      >
                        <PiSignOutBold />
                        Log out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    )
  );
}
