"use client";

import { useTimeout } from "@/hooks/use-timeout";
interface TimerRedirectProps {
  redirectTo: string;
  delayInMs: number;
}
const TimerRedirect = ({ redirectTo, delayInMs }: TimerRedirectProps) => {
  const remainingTime = useTimeout(delayInMs, redirectTo);
  return (
    <div className="text-center mt-6">
      <p className="text-gray-600 font-semibold">
        Redirecting in
        <span className="text-green-500 text-xl"> {remainingTime}</span> seconds
      </p>
    </div>
  );
};

export default TimerRedirect;
