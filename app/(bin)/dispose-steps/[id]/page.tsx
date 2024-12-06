"use client";
import ButtonRedirect from "@/components/Button/ButtonRedirect";
import Card from "@/components/Card/Card";
import CardBody from "@/components/Card/CardBody";
import CardHeader from "@/components/Card/CardHeader";
import { useIdle } from "@/hooks/use-idle";
import { pusherClient } from "@/lib/pusher";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { RingLoader } from "react-spinners";
import useSound from "use-sound";

const DisposeStepsPage = ({ params }: { params: { id: string } }) => {
  const [play, { sound, stop }] = useSound("/welcome.mp3");
  useEffect(() => {
    play();
    return () => stop();
  }, [sound, play, stop]);
  const router = useRouter();

  useEffect(() => {
    pusherClient.subscribe(`start-detect-${params.id}`);
    pusherClient.bind("start-update", (data: { start: boolean }) => {
      if (data.start === true) {
        router.push(`/detect-material/${params.id}`);
      }
    });
    return () => pusherClient.unsubscribe(`start-detect-${params.id}`);
  }, [router, params.id]);

  const [isIdle] = useIdle(5000);
  const path = usePathname();
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch("http://localhost:8080", {
          method: "HEAD", // HEAD requests are lightweight and only check if the server is live
        });
        if (response.ok) {
          // redirect only if the server live
          router.push(
            `http://localhost:8080/index.html?referrer=${encodeURIComponent(
              `https://major-project-tp.vercel.app${path}`
            )}`
          );
        } else {
          console.error("Server is not live");
        }
      } catch (error) {
        console.error("Unable to connect to the server:", error);
      }
    };
    if (isIdle && typeof window !== "undefined") {
      checkServer();
    }
  }, [router, isIdle, path]);

  return (
    <Card rounded>
      <div className="flex items-center justify-center mb-6 gap-x-3">
        <CardHeader>Recycling Steps</CardHeader>
        <RingLoader color="#22c55e" />
      </div>
      <CardBody>
        <div className="flex flex-col space-y-8">
          {recyclingSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 text">
              <span className="text-3xl text-green-500 font-bold">
                {index + 1}.
              </span>
              <div>
                <h2 className="text-slate-800">{step.title}</h2>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

const recyclingSteps = [
  {
    title: "Place your rubbish in the red box",
    description:
      "Ensure the item is within the detection area for accurate scanning.",
  },
  {
    title: "Wait for the material to be detected",
    description:
      "Our system will automatically recognize and classify the material.",
  },
  {
    title: "Dispose your item in the designated bin",
    description:
      "The correct bin will open based on the type of material detected.",
  },
  {
    title: "Scan the generated QR code",
    description: "Use the code to earn points and redeem rewards in the app.",
  },
];

export default DisposeStepsPage;
