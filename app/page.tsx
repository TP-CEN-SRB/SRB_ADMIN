import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";

export default async function Home() {
  const user = await getSessionUser();

  const buttonData = [
    {
      href: `/dispose-steps/${user?.id}`,
      label: "Get started",
      color: "green",
    },
    { href: `/bin-capacity`, label: "Bin Capacity", color: "blue" },
    { href: `/rewards/${user?.id}`, label: "My Rewards", color: "orange" },
    { href: `/settings/${user?.id}`, label: "Settings", color: "purple" },
  ];

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-gray-800 mb-4">
          Welcome to the Smart Recycling Bin!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Help reduce waste and earn rewards by recycling responsibly.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-8 min-h-[200px]">
          {buttonData.map((button, index) => (
            <Button
              key={index}
              asChild
              className={`bg-${button.color}-500 hover:bg-${button.color}-600 text-white lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-all h-full`}
            >
              <Link href={button.href}>{button.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
