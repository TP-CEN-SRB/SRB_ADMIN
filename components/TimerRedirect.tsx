"use client";

import { useTimeout } from "@/hooks/use-timeout";
import { Button } from "./ui/button";
interface TimerRedirectProps {
  redirectTo: string;
  delayInMs: number;
  resetTimeInMs?: number;
}
const TimerRedirect = ({
  redirectTo,
  delayInMs,
  resetTimeInMs,
}: TimerRedirectProps) => {
  const { remainingTime, resetTimer } = useTimeout(delayInMs, redirectTo);
  return (
    <div className="text-center">
      {resetTimeInMs && (
        <div className="mt-4">
          <Button
            onClick={() => resetTimer(resetTimeInMs)}
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-gray-50 text-xl font-semibold py-6 px-6 min-w-56 rounded-full transition-all"
          >
            I need more time
          </Button>
        </div>
      )}

      <p className="text-slate-600 font-semibold mt-4">
        Redirecting in
        <span className="text-green-500 text-xl"> {remainingTime}</span> seconds
      </p>
    </div>
  );
};

export default TimerRedirect;
