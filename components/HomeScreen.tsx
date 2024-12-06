"use client";
import Link from "next/link";
import { FaRecycle } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaPowerOff } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { useState } from "react";
import SignOutDialog from "./Dialog/SignOutDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const HomeScreen = ({
  userId,
  role,
}: {
  userId: string | undefined;
  role: string | undefined;
}) => {
  const binButtons = [
    {
      href: `/dispose-steps/${userId}`,
      label: "Get started",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      icon: <FaRecycle />,
    },
    {
      href: `/bin-capacity`,
      label: "Bin capacity",
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
      icon: <FaTrash />,
    },
  ];
  const adminButtons = [
    {
      href: `/admin`,
      label: "Admin dashboard",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      icon: <RiAdminFill />,
    },
  ];
  const [isSignOutDialogOpen, setSignOutDialogOpen] = useState(false);
  return (
    <div className="bg-[var(--pastel-green)] antialiased">
      <div className="h-screen max-w-screen-lg flex items-center justify-center container mx-auto px-4">
        <div className="text-center max-w-screen-lg w-full">
          <h1 className="text-slate-800 mb-4">
            Welcome to the Smart Recycling Bin!
          </h1>
          <p className="text-lg text-slate-700 mb-8">
            Help reduce waste and earn rewards by recycling responsibly.
          </p>
          {role === "ADMIN" ? (
            <div className="flex justify-center">
              <div className="w-full">
                {adminButtons.map((button, index) => (
                  <Link key={index} href={button.href}>
                    <button
                      className={`${button.color} ${button.hoverColor} text-gray-50  min-h-[100px] lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-colors h-full w-full flex items-center justify-center gap-x-3`}
                    >
                      {button.icon}
                      {button.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center justify-center">
              <SignOutDialog
                isOpen={isSignOutDialogOpen}
                handleDialogOpen={() =>
                  setSignOutDialogOpen(!isSignOutDialogOpen)
                }
              />
              {role === "BIN" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSignOutDialogOpen(true)}
                        className="absolute top-5 right-5 p-3 text-white bg-red-500 rounded-full"
                      >
                        <FaPowerOff size={30} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {binButtons.map((button, index) => (
                <Link className="w-full" key={index} href={button.href}>
                  <button
                    className={`${button.color} ${button.hoverColor} text-gray-50 min-h-[100px] lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-colors h-full w-full flex items-center justify-center gap-x-3`}
                  >
                    {button.icon}
                    {button.label}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
