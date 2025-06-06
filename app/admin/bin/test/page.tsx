"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publishMqtt } from "@/lib/mqtt";
import { toast } from "@/hooks/use-toast";
import {
  ableToPublishMqttMessage,
  updateCommandUpdatedAt,
} from "@/utils/mqttPublisher";

const materials = ["plastic", "general", "paper"];

const BinTestPage = () => {
  const [binId, setBinId] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const waitForReadOnce = (material: string): Promise<void> => {
    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        const { topic, message } = JSON.parse(event.data);
        if (
          topic === `srb/total/${material}` &&
          message?.command === "readonce"
        ) {
          window.removeEventListener("message", handler);
          resolve();
        }
      };

      window.addEventListener("message", handler);
    });
  };

  const testBin = async () => {
    if (!binId) {
      toast({ title: "Error", description: "Please enter a Bin ID" });
      return;
    }

    setIsTesting(true);

    for (const material of materials) {
      const topic = `srb/${material}/${binId}`;
      const readTopic = `srb/total/${material}`;

      const able = await ableToPublishMqttMessage(binId);
      if (!able) {
        toast({ title: "Rate Limited", description: `Wait before retrying ${material}` });
        continue;
      }

      const success = await publishMqtt(topic, JSON.stringify({ command: "detect" }));
      if (success) {
        toast({ title: `${material.toUpperCase()} Detect Sent`, description: `Waiting for readonce...` });
        await updateCommandUpdatedAt(binId);
        await waitForReadOnce(material);
        toast({ title: `${material.toUpperCase()} Readonce`, description: `Response received!` });
      } else {
        toast({ title: "Error", description: `Failed to send to ${material}` });
      }
    }

    setIsTesting(false);
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">MQTT Bin Test</h1>
      <Input
        placeholder="Enter Bin ID"
        value={binId}
        onChange={(e) => setBinId(e.target.value)}
      />
      <Button onClick={testBin} disabled={isTesting}>
        {isTesting ? "Testing..." : "Test Bin"}
      </Button>
    </div>
  );
};

export default BinTestPage;
