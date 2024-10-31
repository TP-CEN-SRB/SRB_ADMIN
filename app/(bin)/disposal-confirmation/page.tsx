import Card from "@/components/Card/Card";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";
import React from "react";

const DisposalConfirmationPage = async () => {
  const user = await getSessionUser();
  return (
    <Card>
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-gray-800">Thank You!</h1>
        <h2 className="text-lg text-gray-600">
          Your points has been recorded.
        </h2>
        <div className="mt-6 space-x-4">
          <Button
            asChild
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-all"
          >
            <Link href={`/detect-material/${user?.id}`}>Scan Another Item</Link>
          </Button>
          <Button
            asChild
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-all"
          >
            <Link href="/">Go to main page</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DisposalConfirmationPage;
