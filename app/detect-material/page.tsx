"use client";
import { useState, useEffect } from "react";
import { FadeLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import CardButton from "@/components/Card/CardButton";
import { useTimeout } from "@/hooks/use-timeout";

const DetectMaterialPage = () => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState<string>();
  const [weightInGrams, setWeightInGrams] = useState<number>();

  const remainingTime = useTimeout(30000, "/");

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event: MessageEvent) => {
      const { material, weightInGrams } = JSON.parse(event.data);
      setMaterial(material);
      setWeightInGrams(weightInGrams);
      setDetecting(false);
    };
    // Clean up the EventSource when the component unmounts
    return () => {
      eventSource.close();
    };
  }, [detecting]);

  return (
    <Card>
      <div className="flex flex-col items-center justify-center gap-y-3 mb-6">
        <CardHeader>Material Detection</CardHeader>
        {detecting && <FadeLoader color="#22c55e" />}
      </div>
      <CardBody>
        {detecting ? (
          <p className="text-gray-600 text-center text-lg">
            Detecting the material of your item...
          </p>
        ) : material && weightInGrams ? (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-green-500">
              {material} Detected
            </h2>
            <h2 className="text-3xl font-semibold text-green-500">
              Weight {weightInGrams}g
            </h2>
            <p className="text-gray-600">
              Please dispose the item in the opened bin.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-center text-lg">
            Unable to detect material. Please try again.
          </p>
        )}
      </CardBody>
      {material && !detecting && <CardButton href="">Proceed</CardButton>}
      <div className="text-center mt-6">
        <p className="text-gray-600 font-semibold">
          Redirecting in
          <span className="text-green-500 text-xl"> {remainingTime}</span>{" "}
          seconds
        </p>
      </div>
    </Card>
  );
};

export default DetectMaterialPage;
