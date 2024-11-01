"use client";
import { useState, useEffect } from "react";
import { FadeLoader } from "react-spinners";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";
import CardBody from "@/components/Card/CardBody";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { createDisposal } from "@/app/action/disposal";
import { BinMaterial } from "@prisma/client";
import TimerRedirect from "@/components/TimerRedirect";
import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher";

const DetectMaterialPage = ({ params }: { params: { id: string } }) => {
  const [detecting, setDetecting] = useState(true);
  const [material, setMaterial] = useState<BinMaterial>();
  const [weightInGrams, setWeightInGrams] = useState<number>();

  const [error, setError] = useState<string>();
  const [thrown, setThrown] = useState(false);
  const router = useRouter();
  /** SSE
   */
  // useEffect(() => {
  //   const eventSource = new EventSource("/api/detect-material");
  //   eventSource.onmessage = (event: MessageEvent) => {
  //     const { material, weightInGrams, thrown } = JSON.parse(event.data);
  //     if (thrown === undefined) {
  //       if (
  //         !Object.values(BinMaterial).includes(material) ||
  //         isNaN(weightInGrams) ||
  //         !material ||
  //         !weightInGrams
  //       ) {
  //         setDetecting(false);
  //         setError("Unable to detect material. Please try again");
  //       }
  //       setMaterial(material);
  //       setWeightInGrams(weightInGrams);
  //       setDetecting(false);
  //     }
  //     setThrown(thrown);
  //   };
  //   return () => {
  //     eventSource.close();
  //   };
  // }, [material, router, weightInGrams]);

  // useEffect(() => {
  //   const handleDisposal = async () => {
  //     if (thrown === true && material && weightInGrams) {
  //       const data = await createDisposal({
  //         material: material as BinMaterial,
  //         weightInGrams,
  //       });
  //       setError(data?.error);
  //       if (data?.id) {
  //         router.push(`/disposal-qr?id=${data.id}`);
  //       }
  //     }
  //   };

  //   handleDisposal();
  // }, [thrown]);

  /** Polling
   */
  // const fetchMaterial = async () => {
  //   const response = await fetch(`/api/detect-material/${params.id}`, {
  //     method: "GET",
  //   });
  //   if (response.ok) {
  //     const { material, weightInGrams, thrown } = await response.json();
  //     if (thrown === undefined && material && weightInGrams) {
  //       if (
  //         !Object.values(BinMaterial).includes(material) ||
  //         isNaN(weightInGrams)
  //       ) {
  //         setDetecting(false);
  //         setError("Unable to detect material. Please try again");
  //       }
  //       setMaterial(material);
  //       setWeightInGrams(weightInGrams);
  //       setDetecting(false);
  //     }
  //     setThrown(thrown);
  //   }
  // };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (detecting || thrown !== true) {
  //       fetchMaterial();
  //     } else {
  //       clearInterval(interval);
  //     }
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [detecting, thrown]);

  useEffect(() => {
    const handleDisposal = async () => {
      if (thrown === true && material && weightInGrams) {
        const data = await createDisposal(
          {
            material: material as BinMaterial,
            weightInGrams,
          },
          params.id
        );
        setError(data?.error);
        if (data?.id) {
          router.push(`/disposal-qr/${params.id}?disposalId=${data.id}`);
        }
      }
    };

    handleDisposal();
  }, [thrown]);

  /**
   *Pusher
   */
  useEffect(() => {
    pusherClient.subscribe(`detect-material-${params.id}`);
    pusherClient.bind(
      "material-details",
      (data: {
        material: BinMaterial;
        weightInGrams: number;
        thrown: boolean;
      }) => {
        if (data.thrown === undefined && data.material && data.weightInGrams) {
          if (
            !Object.values(BinMaterial).includes(data.material) ||
            isNaN(data.weightInGrams)
          ) {
            setDetecting(false);
            setError("Unable to detect material. Please try again");
          }
          setMaterial(data.material);
          setWeightInGrams(data.weightInGrams);
          setDetecting(false);
        }
        if (material && weightInGrams) setThrown(data.thrown);
      }
    );
    return () => pusherClient.unsubscribe(`detect-material-${params.id}`);
  }, [material, weightInGrams, thrown, params.id, router]);

  const handleCancel = () => {
    setDetecting(false);
    setError("Cancelling detection process. Please wait");
  };

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
        <div className="flex flex-col items-center justify-center mt-4">
          <BeatLoader color="#22c55e" />
          {thrown && (
            <p className="text-gray-600">Generating your qr code...</p>
          )}
        </div>
      )}
      {error && <TimerRedirect delayInMs={3000} redirectTo="/" />}
      {!error && !thrown && <TimerRedirect delayInMs={150000} redirectTo="/" />}
      {!error && detecting && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleCancel}
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white text-lg font-semibold py-6 px-6 min-w-56 rounded-full transition-all"
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DetectMaterialPage;
