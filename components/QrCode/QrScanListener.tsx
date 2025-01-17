"use client";
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const QrScanListener = ({ userId }: { userId: string }) => {
  const router = useRouter();

  /**
   *  Pusher
   */
  useEffect(() => {
    pusherClient.subscribe(`disposal-qr-${userId}`);
    pusherClient.bind("disposal-update", (data: { updated: boolean }) => {
      if (data.updated === true) {
        router.push(`/disposal-confirmation/${userId}`);
      }
    });
    return () => pusherClient.unsubscribe(`disposal-qr-${userId}`);
  }, [router, userId]);
  return null;
};

export default QrScanListener;
