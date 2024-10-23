"use client";
import { useEffect, useState } from "react";

const QrCodePage = () => {
  const [material, setMaterial] = useState<string>();
  const [weightInGrams, setWeightInGrams] = useState<number>();

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");
    eventSource.onmessage = (event: MessageEvent) => {
      const { material, weightInGrams } = JSON.parse(event.data);
      setMaterial(material);
      setWeightInGrams(weightInGrams);
    };
    // Clean up the EventSource when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>{material ? material : "Loading material"}</h1>
      <h1>{weightInGrams ? weightInGrams : "Loading weight"}</h1>
    </div>
  );
};

export default QrCodePage;
