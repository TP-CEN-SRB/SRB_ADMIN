"use client";
import Link from "next/link";
import { RiAdminFill } from "react-icons/ri";
const HomeScreen = () => {
  const adminButtons = [
    {
      href: `/admin`,
      label: "Admin dashboard",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      icon: <RiAdminFill />,
    },
  ];
  return (
    <div className="bg-(--pastel-green) antialiased">
      <div className="h-screen max-w-(--breakpoint-lg) flex items-center justify-center container mx-auto px-4">
        <div className="text-center max-w-(--breakpoint-lg) w-full">
          <h1 className="text-slate-800 mb-4">
            Welcome to the Smart Recycling Bin!
          </h1>
          <p className="text-lg text-slate-700 mb-8">
            Help reduce waste and earn rewards by recycling responsibly.
          </p>
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
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
