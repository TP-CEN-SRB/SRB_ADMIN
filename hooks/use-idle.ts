import { useCallback, useEffect, useRef, useState } from "react";

export const useIdle = (timeoutDurationInMs: number) => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(
    (newDelayInMs: number) => {
      setIsIdle(false);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, newDelayInMs);
    },
    [timeoutDurationInMs]
  );

  const handleUserActivity = useCallback(() => {
    resetIdleTimer(timeoutDurationInMs);
  }, [resetIdleTimer]);

  useEffect(() => {
    resetIdleTimer(timeoutDurationInMs);
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) =>
      window.addEventListener(event, handleUserActivity)
    );
    return () => {
      // Cleanup event listeners and timeout on unmount
      events.forEach((event) =>
        window.removeEventListener(event, handleUserActivity)
      );
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [handleUserActivity, timeoutDurationInMs]);

  return [isIdle];
};
