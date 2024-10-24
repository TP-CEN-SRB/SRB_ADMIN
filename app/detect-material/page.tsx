"use client";
import { useState, useEffect } from "react";
import { FadeLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { createDisposal } from "../action/disposal";
import { BinMaterial } from "@prisma/client";
import TimerRedirect from "@/components/TimerRedirect";

const DetectMaterialPage = () => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState<BinMaterial>();
  const [weightInGrams, setWeightInGrams] = useState<number>();

  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource("/api/detect-material");

    eventSource.onmessage = (event: MessageEvent) => {
      const { material, weightInGrams, thrown } = JSON.parse(event.data);
      if (thrown === undefined) {
        if (
          !Object.values(BinMaterial).includes(material) ||
          isNaN(weightInGrams) ||
          !material ||
          !weightInGrams
        ) {
          setDetecting(false);
          setError("Unable to detect material. Please try again");
        }
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
        setError(data?.error);
        if (data?.id) {
          router.push(`/disposal-qr?id=${data.id}`);
        }
      }
    };

    handleDisposal();
  }, [thrown]);

  return (
    <Card>
      {thrown ? <></> : <></>}
      <div className="flex flex-col items-center justify-center gap-y-3 mb-6">
        <CardHeader>Material Detection</CardHeader>
        {detecting && <FadeLoader color="#22c55e" />}
      </div>
      <CardBody>
        {detecting ? (
          <p className="text-gray-600 text-center text-lg">
            Detecting the material of your item...
          </p>
        ) : !error ? (
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
      {!detecting && !error && (
        <div className="flex justify-center mt-4">
          <BeatLoader color="#22c55e" />
        </div>
      )}
      {error && <TimerRedirect delayInMs={3000} redirectTo="/" />}
      {!error && <TimerRedirect delayInMs={150000} redirectTo="/" />}
    </Card>
  );
};

export default DetectMaterialPage;
