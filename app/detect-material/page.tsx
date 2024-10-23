"use client";
import { useState, useEffect } from "react";
import { FadeLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import { useTimeout } from "@/hooks/use-timeout";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { createDisposal } from "../action/disposal";
import { BinMaterial } from "@prisma/client";

const DetectMaterialPage = () => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState<BinMaterial>();
  const [weightInGrams, setWeightInGrams] = useState<number>();

  const [success, setSuccess] = useState<string>();
  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);
  const router = useRouter();
  const remainingTime = useTimeout(150000, "/");

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event: MessageEvent) => {
      const { material, weightInGrams, thrown } = JSON.parse(event.data);
      if (
        !Object.values(BinMaterial).includes(material) ||
        isNaN(weightInGrams)
      ) {
        setDetecting(false);
        setError("Unable to detect material. Please try again");
      } else if (!thrown) {
        setMaterial(material);
        setWeightInGrams(weightInGrams);
        setDetecting(false);
      }
      setThrown(thrown);
    };
    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const handleDisposal = async () => {
      if (thrown === true && material && weightInGrams) {
        const data = await createDisposal({
          material: material as BinMaterial,
          weightInGrams,
        });
        setSuccess(data?.success);
        setError(data?.error);
        if (data?.success) {
          router.push("/qr-code");
        }
      }
    };

    handleDisposal();
  }, [thrown]);

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
        ) : material && weightInGrams && !error ? (
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
          <p className="text-gray-600 text-center text-lg">{error}</p>
        )}
      </CardBody>
      {!detecting && material && weightInGrams && !error && (
        <div className="flex justify-center mt-4">
          <BeatLoader color="#22c55e" />
        </div>
      )}
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
