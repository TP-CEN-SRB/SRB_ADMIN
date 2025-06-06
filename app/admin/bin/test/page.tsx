"use client";

import { useState } from "react";
import { publishMqtt } from "@/lib/mqtt";
import {
  ableToPublishMqttMessage,
  updateCommandUpdatedAt,
  resetCommandCooldown,
} from "@/utils/mqttPublisher";
import { toast } from "@/hooks/use-toast";

const materials = ["plastic", "general", "paper"];

const TestBinPage = () => {
  const [binId, setBinId] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!binId) {
      toast({ title: "Missing Bin ID" });
      return;
    }

    setIsTesting(true);

    for (const material of materials) {
      const topic = `srb/${material}/${binId}`;
      const payload = JSON.stringify({ command: "detect" });

      toast({ title: `Testing ${material}...` });

      const canPublish = await ableToPublishMqttMessage(binId);
      if (!canPublish) {
        toast({
          title: "Wait before retrying",
          description: `Cooldown not finished for ${material}`,
        });
        continue;
      }

      const success = await publishMqtt(topic, payload);
      if (success) {
        await updateCommandUpdatedAt(binId);
        toast({
          title: "Command Sent",
          description: `detect → ${material}`,
        });

        // Simulate delay for test (replace with listener if needed)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        toast({
          title: "Failed",
          description: `Could not send to ${material}`,
        });
      }
    }

    setIsTesting(false);
  };

  const handleResetCooldown = async () => {
    if (!binId) {
      toast({ title: "Missing Bin ID" });
      return;
    }

    await resetCommandCooldown(binId);
    toast({
      title: "Cooldown Reset",
      description: "You can test immediately again.",
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Test Bin MQTT</h1>
      <input
        type="text"
        placeholder="Enter Bin ID"
        value={binId}
        onChange={(e) => setBinId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
      />
      <div className="flex flex-col gap-3">
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
        >
          {isTesting ? "Testing..." : "Test Bin"}
        </button>
        <button
          onClick={handleResetCooldown}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
        >
          Reset Cooldown
        </button>
      </div>
    </div>
  );
};

export default TestBinPage;
