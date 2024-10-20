// import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  // const session = await auth();
  // const user = session?.user;
  return (
    <div className="flex items-center justify-center">
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
          <Link href="/dispose-steps">Tap here to get started</Link>
        </Button>
      </div>
    </div>
  );
}
