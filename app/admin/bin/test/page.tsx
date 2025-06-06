"use client";

import { useState, useEffect } from "react";
import { MqttClient } from "mqtt";
import { publishMqtt, connectMqtt } from "@/lib/mqtt";
import {
  ableToPublishMqttMessage,
  updateCommandUpdatedAt,
  resetCommandCooldown,
} from "@/utils/mqttPublisher";
import { toast } from "@/hooks/use-toast";

const materials = ["plastic", "general", "paper"] as const;

const TestBinPage = () => {
  const [binId, setBinId] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);

  useEffect(() => {
    const init = async () => {
      const client = await connectMqtt();
      setMqttClient(client);
    };
    init();
  }, []);

  const waitForReadOnce = (material: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const topic = `srb/${material}/${binId}`;
      const timeout = setTimeout(() => {
        mqttClient?.off("message", onMessage);
        resolve(false);
      }, 20000); // 20s timeout

      const onMessage = (topicReceived: string, message: Buffer) => {
        if (topicReceived === topic) {
          const payload = JSON.parse(message.toString());
          if (payload.command === "readonce") {
            clearTimeout(timeout);
            mqttClient?.off("message", onMessage);
            resolve(true);
          }
        }
      };

      mqttClient?.on("message", onMessage);
    });
  };

  const handleTest = async () => {
    if (!binId) {
      toast({ title: "Missing Bin ID" });
      return;
    }

    if (!mqttClient) {
      toast({ title: "MQTT not connected" });
      return;
    }

    setIsTesting(true);

    for (const material of materials) {
      const topic = `srb/${material}/${binId}`;
      const payload = JSON.stringify({ command: "detect" });

      toast({ title: `Testing ${material} bin...` });

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
        toast({ title: "Sent", description: `detect → ${material}` });

        const acknowledged = await waitForReadOnce(material);
        if (acknowledged) {
          toast({ title: `${material} bin responded with readonce ✅` });
        } else {
          toast({ title: `${material} bin did not respond in time ❌` });
          break;
        }
      } else {
        toast({ title: "Failed to send", description: `Could not send to ${material}` });
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
      title: "Cooldown reset",
      description: "You can now test again immediately",
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Test Bin MQTT</h1>
      <input
        type="text"
        placeholder="Enter Bin ID"
        value={binId}
        onChange={(e) => setBinId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
      />
      <button
        onClick={handleTest}
        disabled={isTesting}
        className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
      >
        {isTesting ? "Testing..." : "Test Bin"}
      </button>
      <button
        onClick={handleResetCooldown}
        className="bg-gray-600 text-white px-6 py-2 rounded-md"
      >
        Reset Cooldown
      </button>
    </div>
  );
};

export default TestBinPage;
