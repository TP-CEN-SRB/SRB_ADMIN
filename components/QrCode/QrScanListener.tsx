"use client";
import { pusherClient } from "@/lib/pusher";
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
  // const fetchUser = async () => {
  //   const response = await fetch(`/api/disposal/${userId}`, {
  //     method: "GET",
  //   });

  //   if (response.ok) {
  //     const { updated } = await response.json();
  //     if (updated === true) {
  //       router.push("/disposal-confirmation");
  //     }
  //   }
  // };
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchUser();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // });

  /**
   *  Pusher
   */
  useEffect(() => {
    pusherClient.subscribe(`disposal-qr-${userId}`);
    pusherClient.bind("disposal-update", (data: { updated: boolean }) => {
      if (data.updated === true) {
        router.push("/disposal-confirmation");
      }
    });
    return () => pusherClient.unsubscribe(`disposal-qr-${userId}`);
  }, [router, userId]);
  return null;
};

export default QrScanListener;
