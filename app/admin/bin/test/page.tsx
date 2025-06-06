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
import clsx from "clsx";

const materials = ["plastic", "general", "paper"] as const;
type Status = "ready" | "testing" | "success" | "failed";

const TestBinPage = () => {
  const [binId, setBinId] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Status>>({
    plastic: "ready",
    general: "ready",
    paper: "ready",
  });

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

  const updateStatus = (material: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [material]: status }));
  };

  const handleTest = async () => {
    if (!binId) return toast({ title: "Missing Bin ID" });
    if (!mqttClient) return toast({ title: "MQTT not connected" });

    setIsTesting(true);
    for (const material of materials) {
      updateStatus(material, "testing");

      const topic = `srb/${material}/${binId}`;
      const payload = JSON.stringify({ command: "detect" });

      const canPublish = await ableToPublishMqttMessage(binId);
      if (!canPublish) {
        toast({
          title: "Wait before retrying",
          description: `Cooldown not finished for ${material}`,
        });
        updateStatus(material, "failed");
        continue;
      }

      const success = await publishMqtt(topic, payload);
      if (success) {
        await updateCommandUpdatedAt(binId);
        const acknowledged = await waitForReadOnce(material);
        if (acknowledged) {
          updateStatus(material, "success");
        } else {
          updateStatus(material, "failed");
          break;
        }
      } else {
        updateStatus(material, "failed");
      }
    }
    setIsTesting(false);
  };

  const handleResetCooldown = async () => {
    if (!binId) return toast({ title: "Missing Bin ID" });
    await resetCommandCooldown(binId);
    toast({ title: "Cooldown reset", description: "You can now test again" });
  };

  const statusStyle = {
    ready: "border-l-gray-400 text-gray-700",
    testing: "border-l-yellow-500 text-yellow-800",
    success: "border-l-green-500 text-green-700",
    failed: "border-l-red-500 text-red-700",
  };

  const statusLabel = (status: Status) => {
    switch (status) {
      case "ready":
        return "🕓 Ready to test";
      case "testing":
        return "⏳ Testing...";
      case "success":
        return "✅ Test passed";
      case "failed":
        return "❌ Test failed";
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Test Bin MQTT</h1>

      <input
        type="text"
        placeholder="Enter Bin ID"
        value={binId}
        onChange={(e) => setBinId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
      />

      <div className="flex gap-4">
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

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Bin Test Status</h2>
        <div className="space-y-3">
          {materials.map((mat) => (
            <div
              key={mat}
              className={clsx(
                "border-l-8 rounded-md p-4 bg-white shadow-sm flex justify-between items-center",
                statusStyle[statuses[mat]]
              )}
            >
              <div>
                <p className="font-bold capitalize">{mat}</p>
                <p className="text-sm">{statusLabel(statuses[mat])}</p>
              </div>
              <span className="text-2xl">{statusLabel(statuses[mat]).split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestBinPage;
