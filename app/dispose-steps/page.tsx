"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RingLoader } from "react-spinners";
import useSound from "use-sound";

const DisposeStepsPage = () => {
  const timeoutDurationInMs = 30000;
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(
    timeoutDurationInMs / 1000
  );
  const [play, { sound }] = useSound("/welcome.mp3");
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
    }, timeoutDurationInMs);

    return () => clearTimeout(timeout);
  }, [router]);
  useEffect(() => {
    play();
  }, [sound, play]);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col justify-center items-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full">
        <div className="flex items-center justify-center mb-6 gap-x-3">
          <h1 className="text-4xl text-gray-800 text-center">
            Recycling Steps
          </h1>
          <RingLoader color="#22c55e" />
        </div>
        <div className="space-y-8">
          {recyclingSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4">
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

        <div className="mt-8 text-center">
          <Button className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-6 px-6 rounded-full transition-all max-w-56 w-full">
            Continue
          </Button>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-600 font-semibold">
            Redirecting in
            <span className="text-green-500 text-xl">
              {" "}
              {remainingTime}
            </span>{" "}
            seconds
          </p>
        </div>
      </div>
    </div>
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
