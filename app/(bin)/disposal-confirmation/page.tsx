import Card from "@/components/Card/Card";
import TimerRedirect from "@/components/TimerRedirect";
import { getSessionUser } from "@/utils/getAuth";
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
        <TimerRedirect
          redirectTo={`/dispose-steps/${user?.id}`}
          delayInMs={5000}
        />
      </div>
    </Card>
  );
};

export default DisposalConfirmationPage;
