import Link from "next/link";
import React from "react";
import { FaBell } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-screen flex container mx-auto max-w-screen-lg">
        <div className="grid grid-cols-6 gap-8 absolute top-0 bg-white w-full h-20 ">
          <div className="col-start-1 col-end-2 flex flex-row justify-center items-center">
            <img src="/temasekPolyBanner.png" />
          </div>
          <ul className="col-start-2 col-end-6 flex flex-row justify-center items-center px-40">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="transition duration-300 ease-out hover:ease-in hover:scale-110 cursor-pointer"
              >
                <Link
                  href={item.href}
                  className="font-semibold text-gray-500 p-8"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="col-start-6 col-span-1 flex justify-center items-center">
            <div className="text-4xl mx-4 cursor-pointer">
              <FaBell />
            </div>
            <div className="text-4xl mx-4 cursor-pointer">
              <CgProfile />
            </div>
          </div>
        </div>
        <main className="">{children}</main>
      </div>
    </>
  );
}

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Bin",
    href: "/admin/bin/create",
  },
  {
    label: "Users",
    href: "/admin/users",
  },
  {
    label: "Rewards",
    href: "/admin/rewards",
  },
];
