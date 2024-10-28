"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const QrScanListener = ({ userId }: { userId: string }) => {
  const router = useRouter();
  /**
   SSE
   */
  // useEffect(() => {
  //   const eventSource = new EventSource("/api/disposal");

  //   eventSource.onmessage = (event: MessageEvent) => {
  //     const { updated } = JSON.parse(event.data);
  //     if (updated === true) {
  //       router.push("/disposal-confirmation");
  //     }
  //   };
  //   return () => {
  //     eventSource.close();
  //   };
  // }, [router]);

  /**
   Polling
   */
  const fetchUser = async () => {
    console.log(userId);
    const response = await fetch(`/api/disposal/${userId}`, {
      method: "GET",
    });

    if (response.ok) {
      const { updated } = await response.json();
      if (updated === true) {
        router.push("/disposal-confirmation");
      }
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUser();
    }, 5000);
    return () => clearInterval(interval);
  });
  return <div></div>;
};

export default QrScanListener;
