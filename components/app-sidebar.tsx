"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
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
import {
  FaBell,
  FaTrash,
  FaUser,
  FaChevronRight,
  FaEye,
  FaPlus,
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { logout } from "@/app/action/user";
import { PiSignOutBold } from "react-icons/pi";
import { GiPresent } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useState } from "react";

const items = [
  {
    title: "Bins",
    icon: FaTrash,
    child: [
      {
        title: "View",
        icon: FaEye,
        url: "/admin/bin",
      },
      {
        title: "Create",
        icon: FaPlus,
        url: "/admin/bin/create",
      },
    ],
  },
  {
    title: "Users",
    icon: FaUser,
    child: [
      {
        title: "View",
        icon: FaEye,
        url: "/admin/user",
      },
      {
        title: "Create",
        icon: FaPlus,
        url: "/admin/user/create",
      },
    ],
  },
  {
    title: "Rewards",
    icon: GiPresent,
    child: [
      {
        title: "View",
        icon: FaEye,
        url: "/admin/reward",
      },
      {
        title: "Create",
        icon: FaPlus,
        url: "/admin/reward/create",
      },
    ],
  },
];

export function AppSidebar({ email }: { email: string | null | undefined }) {
  const path = usePathname();
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
  return (
    enableNav.some((route) => path.startsWith(route)) && (
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu className="p-4">
            <Image
              src="/temasekPolyBanner.png"
              alt="Temasek Poly"
              width="300"
              height="300"
            />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem className="ml-4">
              <SidebarMenuButton asChild>
                <Link href="/admin">
                  <BsFillBarChartFill />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {items.map((item, index) => (
              <Collapsible
                key={index}
                className="group/collapsible"
                onOpenChange={() => handleToggle(index)}
                open={openIndexes.includes(index)}
              >
                <SidebarMenuItem className="mx-4">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                      <FaChevronRight
                        className={`ml-auto duration-100 ease ${
                          openIndexes.includes(index) ? "rotate-90" : "rotate-0"
                        }  `}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.child.map((child, subIndex) => (
                        <Link href={child.url}>
                          <SidebarMenuSubItem
                            className="pl-2 ml-2 hover:!bg-[#f5f2b3] rounded-lg"
                            key={subIndex}
                          >
                            <SidebarMenuButton>
                              <child.icon />
                              <span>{child.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        </Link>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
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
                  <DropdownMenuItem className="hover:!bg-[#f5f2b3]">
                    <IoSettings />
                    Settings
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
