"use client";
import React from "react";
import Link from "next/link";
import { FaBell } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { PiListBold } from "react-icons/pi";
import { usePathname } from "next/navigation";
import { enableNav } from "@/utils/enableNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiSignOutBold } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { logout } from "../action/user";
import { IoSettings } from "react-icons/io5";

const Header = () => {
  const path = usePathname();
  return (
    enableNav.some((route) => path.startsWith(route)) && (
      <div className="sticky top-0 left-0 right-0 bg-[#f7f6c5] z-10 shadow-xl">
        <div className="max-w-[2000px] mx-auto px-4 h-20">
          <div className="flex items-center justify-between h-full">
            {/* Left section - Logo and mobile menu */}
            <div className="flex items-center gap-4">
              <button className="text-4xl lg:hidden text-gray-500 hover:text-gray-900">
                <PiListBold />
              </button>
              <img
                src="/temasekPolyBanner.png"
                alt="Temasek Poly"
                className="h-12 w-auto"
              />
            </div>

            {/* Middle section - Navigation */}
            <nav className="hidden lg:block flex-1 px-4">
              <ul className="flex justify-center items-center space-x-8">
                {navItems.map((item) => (
                  <li
                    key={item.label}
                    className="transition duration-300 hover:scale-105"
                  >
                    <Link
                      href={item.href}
                      className="font-semibold text-gray-500 px-4 py-2 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right section - Icons */}
            <div className="flex items-center gap-4">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="text-4xl text-gray-500 hover:text-gray-900">
                  <CgProfile />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="left" sideOffset={10}>
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FaUser />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FaBell />
                    Notification
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IoSettings />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
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
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Header;

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Bin",
    href: "/admin/bin",
  },
  {
    label: "Users",
    href: "/admin/users",
  },
  {
    label: "Rewards",
    href: "/admin/reward",
  },
];
