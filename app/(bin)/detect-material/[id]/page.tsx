"use client";
import { useState, useEffect } from "react";
import { FadeLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { createDisposal } from "@/app/action/disposal";
import TimerRedirect from "@/components/TimerRedirect";
import { pusherClient } from "@/lib/pusher";
import { getBinByUserIdAndMaterial } from "@/app/action/bin";

const DetectMaterialPage = ({ params }: { params: { id: string } }) => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState("");
  const [weightInGrams, setWeightInGrams] = useState<number>();
  const [binCapacity, setBinCapacity] = useState<number>();

  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);
  const router = useRouter();
  const [resetCondition, setResetCondition] = useState(false);

  useEffect(() => {
    const checkIfBinIsInOrder = async () => {
      if (material) {
        const bin = await getBinByUserIdAndMaterial(params.id, material);
        if (!bin) {
          setDetecting(false);
          setError("No bins found!");
          return;
        }
        if (bin.currentCapacity === 100) {
          setDetecting(false);
          setError(`${bin.binMaterial.name} bin is already full!`);
          return;
        }
        if (bin.status === "UNDER_MAINTENANCE") {
          setDetecting(false);
          setError(`${bin.binMaterial.name} bin is under maintenance!`);
          return;
        }
      }
    };
    checkIfBinIsInOrder();
  }, [params.id, material]);
  useEffect(() => {
    const handleDisposal = async () => {
      if (thrown === true && material && weightInGrams && binCapacity) {
        const data = await createDisposal(
          {
            material,
            weightInGrams,
          },
          params.id,
          binCapacity
        );
        setError(data?.error);
        if (data?.id) {
          router.push(`/disposal-qr/${params.id}?disposalId=${data.id}`);
        }
      }
    };

    handleDisposal();
  }, [thrown, material, params.id, router, weightInGrams, binCapacity]);

  /**
   *Pusher
   */
  useEffect(() => {
    pusherClient.subscribe(`detect-material-${params.id}`);
    pusherClient.bind(
      "material-details",
      (data: {
        material: string;
        weightInGrams: number;
        binCapacity: number;
        thrown: boolean;
      }) => {
        if (
          data.thrown === undefined &&
          data.material &&
          data.weightInGrams === undefined &&
          data.binCapacity === undefined
        ) {
          setMaterial(data.material.toUpperCase() as string);
          setDetecting(false);
          setResetCondition(true);
        }
        if (
          material &&
          data.weightInGrams !== undefined &&
          data.binCapacity !== undefined &&
          data.thrown === true
        ) {
          setWeightInGrams(data.weightInGrams);
          setBinCapacity(data.binCapacity);
          setThrown(data.thrown);
        }
      }
    );
    return () => pusherClient.unsubscribe(`detect-material-${params.id}`);
  }, [material, weightInGrams, thrown, params.id, router]);

  return (
    <Card rounded>
      <div className="flex flex-col items-center justify-center gap-y-3 mb-6">
        <CardHeader>Material Detection</CardHeader>
        {detecting && <FadeLoader color="#22c55e" />}
      </div>
      <CardBody>
        {detecting ? (
          <p className="text-slate-600 text-center text-lg">
            Detecting the material of your item...
          </p>
        ) : !error ? (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-green-500">
              {material} Detected
            </h2>
            <p className="text-slate-600">
              Please dispose the item in the opened bin.
            </p>
          </div>
        ) : (
          <p className="text-slate-600 text-center text-lg">{error}</p>
        )}
      </CardBody>
      {!detecting && !error && (
        <div className="flex flex-col items-center justify-center mt-4">
          <BeatLoader color="#22c55e" />
          {thrown && weightInGrams && (
            <p className="text-slate-600">Generating your qr code...</p>
          )}
        </div>
      )}
      {error && (
        <TimerRedirect
          delayInMs={3000}
          redirectTo={`/dispose-steps/${params.id}`}
        />
      )}
      {!error &&
        !thrown &&
        weightInGrams === undefined &&
        binCapacity === undefined && (
          <TimerRedirect
            delayInMs={30000}
            resetTimeInMs={30000}
            resetCondition={resetCondition}
            redirectTo={`/dispose-steps/${params.id}`}
          />
        )}
    </Card>
  );
};

export default DetectMaterialPage;
