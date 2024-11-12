import React from "react";
import Link from "next/link";
import { FaBell } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { PiListBold } from "react-icons/pi";

const Header = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-10">
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
            <button className="text-4xl text-gray-500 hover:text-gray-900">
              <FaBell />
            </button>
            <button className="text-4xl text-gray-500 hover:text-gray-900">
              <CgProfile />
            </button>
          </div>
        </div>
      </div>
    </div>
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
