import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";

export default async function Home() {
  const user = await getSessionUser();
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-gray-800 mb-4">
          Welcome to the Smart Recycling Bin!
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Help reduce waste and earn rewards by recycling responsibly.
        </p>
        <Button
          asChild
          className="bg-green-500 hover:bg-green-600 text-white text-xl font-semibold py-8 px-8 rounded-full shadow-lg transition-all"
        >
          <Link href={`/dispose-steps?id=${user?.id}`}>
            Tap here to get started
          </Link>
        </Button>
      </div>
    </div>
  );
}
