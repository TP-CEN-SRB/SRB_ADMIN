"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const QrScanListener = () => {
  const router = useRouter();
  useEffect(() => {
    const eventSource = new EventSource("/api/disposal");

    eventSource.onmessage = (event: MessageEvent) => {
      const { updated } = JSON.parse(event.data);
      console.log("Json received", updated);
      if (updated === true) {
        router.push("/");
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);
  return <div></div>;
};

export default QrScanListener;
