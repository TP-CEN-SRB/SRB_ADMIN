import Card from "@/components/Card/Card";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";
import React from "react";

const DisposalConfirmationPage = async () => {
  const user = await getSessionUser();
  return (
    <Card rounded>
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-slate-800">Thank You!</h1>
        <h2 className="text-lg text-slate-600">
          Your disposal has been recorded
        </h2>
        <div className="mt-6 space-x-4">
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-gray-50 text-xl font-semibold p-6 rounded transition-all"
          >
            <Link href={`/detect-material/${user?.id}`}>Scan another item</Link>
          </Button>
          <Button
            asChild
            className="border border-emerald-500 bg-gray-50 text-emerald-500 hover:bg-emerald-50 text-xl font-semibold p-6 rounded transition-all"
          >
            <Link href="/">Go to main page</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DisposalConfirmationPage;
