import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";
import { FaRecycle } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaCoins } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
export default async function Home() {
  const user = await getSessionUser();
  const buttonData = [
    {
      href: `/dispose-steps/${user?.id}`,
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
    {
      href: `/my-points`,
      label: "My points",
      color: "bg-amber-500",
      hoverColor: "hover:bg-amber-600",
      icon: <FaCoins />,
    },
    {
      href: `/bin-settings`,
      label: "Settings",
      color: "bg-slate-500",
      hoverColor: "hover:bg-slate-600",
      icon: <IoSettings />,
    },
  ];

  return (
    <div className="bg-[var(--pastel-green)]">
      <div className="h-screen max-w-screen-lg flex items-center justify-center container mx-auto px-4">
        <div className="text-center max-w-screen-lg w-full">
          <h1 className="text-slate-800 mb-4">
            Welcome to the Smart Recycling Bin!
          </h1>
          <p className="text-lg text-slate-700 mb-8">
            Help reduce waste and earn rewards by recycling responsibly.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8 min-h-[200px]">
            {buttonData.map((button, index) => (
              <Link key={index} href={button.href}>
                <button
                  className={`${button.color} ${button.hoverColor} text-gray-50 lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-colors h-full w-full flex items-center justify-center gap-x-3`}
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
  );
}
