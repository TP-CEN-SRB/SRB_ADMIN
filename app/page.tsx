import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";
import { FaRecycle } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FaCoins } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
export default async function Home() {
  const user = await getSessionUser();
  console.log(user);
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
      label: "Bin Capacity",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      icon: <FaTrash />,
    },
    {
      href: `/my-points`,
      label: "My points",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      icon: <FaCoins />,
    },
    {
      href: `/bin/settings`,
      label: "Settings",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      icon: <IoSettings />,
    },
  ];

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center max-w-screen-lg w-full">
        <h1 className="text-gray-800 mb-4">
          Welcome to the Smart Recycling Bin!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Help reduce waste and earn rewards by recycling responsibly.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8 min-h-[200px]">
          {buttonData.map((button, index) => (
            <Link key={index} href={button.href}>
              <Button
                className={`${button.color} ${button.hoverColor} text-white lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-colors h-full w-full flex gap-x-3`}
              >
                {button.icon}
                {button.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
