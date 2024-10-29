"use client";
import Card from "@/components/Card/Card";
import CardBody from "@/components/Card/CardBody";
import CardButton from "@/components/Card/CardButton";
import CardHeader from "@/components/Card/CardHeader";
import TimerRedirect from "@/components/TimerRedirect";
import React, { useEffect } from "react";
import { RingLoader } from "react-spinners";
import useSound from "use-sound";

const DisposeStepsPage = ({ params }: { params: { id: string } }) => {
  const [play, { sound, stop }] = useSound("/welcome.mp3");
  useEffect(() => {
    play();
    return () => stop();
  }, [sound, play, stop]);
  return (
    <Card>
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
                <h2 className="text-gray-800">{step.title}</h2>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
      <CardButton color="green" href={`/detect-material/${params.id}`}>
        Continue
      </CardButton>
      <TimerRedirect redirectTo="/" delayInMs={30000} />
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
