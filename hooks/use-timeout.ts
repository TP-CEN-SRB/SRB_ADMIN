import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useTimeout = (
  timeoutDurationInMs: number,
  redirectPath: string
) => {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(
    timeoutDurationInMs / 1000
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(redirectPath);
    }, timeoutDurationInMs);

    return () => clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return remainingTime;
};
