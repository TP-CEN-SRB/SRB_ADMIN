import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export const useTimeout = (
  timeoutDurationInMs: number,
  redirectPath: string
) => {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(
    timeoutDurationInMs / 1000
  );
  const [timeoutDuration, setTimeoutDuration] = useState(timeoutDurationInMs);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(
    (newDelayInMs: number) => {
      setTimeoutDuration(newDelayInMs);
      setRemainingTime(newDelayInMs / 1000);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        router.push(redirectPath);
      }, newDelayInMs);
    },
    [router, redirectPath, timeoutDurationInMs]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      router.push(redirectPath);
    }, timeoutDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router, timeoutDuration, redirectPath]);

  return { remainingTime, resetTimer };
};
