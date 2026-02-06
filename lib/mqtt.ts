import mqtt, { MqttClient } from "mqtt";
import { handleBinDiagnostic } from "@/app/action/bin";
import { pusherServer } from "@/lib/pusher";
import {
  upsertGuidanceSession,
  getGuidanceSession,
} from "@/lib/guidance-store";

interface MultiGuidancePayload {
  bins: string[];
  images: Record<string, string>;
}


let client: MqttClient | null = null;
let isConnecting = false;
let subscribed = false;


function isMultiGuidancePayload(value: unknown): value is MultiGuidancePayload {
  if (typeof value !== "object" || value === null) return false;

  const v = value as any;

  return (
    Array.isArray(v.bins) &&
    typeof v.images === "object" &&
    v.images !== null
  );
}


async function handleMultiGuidanceMessage(payload: Buffer): Promise<void> {
  const parsed: unknown = JSON.parse(payload.toString());

  if (!isMultiGuidancePayload(parsed)) {
    console.warn("⚠️ Invalid multi-guidance payload:", parsed);
    return;
  }

  const bins = parsed.bins;
  const images = parsed.images;

  if (bins.length === 0) {
    console.warn("⚠️ UI multi message received with no bins");
    return;
  }

  const sampleImage = images[bins[0]];
  const match = sampleImage?.match(/\/uploads\/(.+?)_/);

  if (!match) {
    console.error("❌ Unable to extract binId from image path:", sampleImage);
    return;
  }

  const binId = match[1];

  console.log("🧭 Starting multi-guidance for bin:", binId);

  upsertGuidanceSession({
    binId,
    bins,
    images,
    currentIndex: 0,
    updatedAt: Date.now(),
  });

  const session = getGuidanceSession(binId)!;
  const currentMaterial = session.bins[0];

  await pusherServer.trigger(`guidance-${binId}`, "guidance-update", {
    active: true,
    material: currentMaterial,
    imageUrl: session.images[currentMaterial],
    step: 1,
    totalSteps: session.bins.length,
  });
}



const connectMqtt = (): Promise<MqttClient> => {
  if (client && client.connected) {
    return Promise.resolve(client);
  }

  if (isConnecting) {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (client?.connected) {
          clearInterval(timer);
          resolve(client);
        }
      }, 200);
    });
  }

  isConnecting = true;

  client = mqtt.connect(process.env.NEXT_PUBLIC_BROKER_URL!, {
    username: process.env.NEXT_PUBLIC_BROKER_USERNAME!,
    password: process.env.NEXT_PUBLIC_BROKER_PASSWORD!,
    keepalive: 30,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  });

  client.on("connect", () => {
    console.log("✅ MQTT connected");

    if (!subscribed) {
      // Existing subscriptions
      client!.subscribe("srb/heartbeat/#", { qos: 0 });
      console.log("Subscribed to heartbeat topic");

      client!.subscribe("srb/health/#", { qos: 0 });
      console.log("Subscribed to diagnostic topic: srb/health/#");

      // 🆕 NEW — UI multi-detect guidance
      client!.subscribe("srb/ui/multi", { qos: 0 });
      console.log("Subscribed to UI multi-guidance topic: srb/ui/multi");

      subscribed = true;
    }

    isConnecting = false;
  });

  client.on("error", (err) => {
    console.error("❌ MQTT Error:", err);
    isConnecting = false;
  });

  client.on("close", () => {
    console.warn("⚠️ MQTT disconnected — retrying...");
    isConnecting = false;
    subscribed = false;
  });

  // 🔥 Listen for ALL MQTT messages
  client.on("message", async (topic, payload) => {
    try {
      // -----------------------------
      // BIN DIAGNOSTICS (existing)
      // -----------------------------
      if (topic.startsWith("srb/health/")) {
        const json = JSON.parse(payload.toString());

        // Topic format: srb/health/<binId>
        const parts = topic.split("/");
        const binId = parts[2];

        if (!binId) {
          console.warn("⚠️ Diagnostic received without binId:", topic);
          return;
        }

        console.log("🛠 Processing diagnostic for bin:", binId);
        await handleBinDiagnostic(binId, json);
        return;
      }

      // -----------------------------
      // 🆕 MULTI-DETECT UI GUIDANCE
      // -----------------------------
      if (topic === "srb/ui/multi") {
        await handleMultiGuidanceMessage(payload);
        return;
      }


    } catch (err) {
      console.error("❌ MQTT message handling error:", err);
    }
  });

  return new Promise((resolve) => {
    client!.once("connect", () => resolve(client!));
  });
};

export const publishMqtt = async (
  topic: string,
  message: string
): Promise<boolean> => {
  const mqttClient = await connectMqtt();

  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, message, { qos: 0 }, (err) => {
      if (err) return reject(false);
      resolve(true);
    });
  });
};

export { connectMqtt };
