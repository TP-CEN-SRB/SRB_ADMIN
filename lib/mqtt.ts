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

/* --------------------------------------------------
   Type Guard
-------------------------------------------------- */
function isMultiGuidancePayload(value: unknown): value is MultiGuidancePayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as any;
  return Array.isArray(v.bins) && typeof v.images === "object" && v.images !== null;
}

/* --------------------------------------------------
   Guidance Advancement
-------------------------------------------------- */
async function advanceGuidance(binId: string) {
  const session = getGuidanceSession(binId);
  if (!session) return;

  const nextIndex = session.currentIndex + 1;

  // ✅ Finished all bins → STOP guidance
  if (nextIndex >= session.bins.length) {
    console.log("🧭 Multi-guidance complete for bin:", binId);

    await pusherServer.trigger(`guidance-${binId}`, "guidance-update", {
      active: false,
      material: "",
      imageUrl: "",
      step: session.bins.length,
      totalSteps: session.bins.length,
    });

    // 🔴 Finalize session to prevent replay
    upsertGuidanceSession({
      ...session,
      currentIndex: session.bins.length,
      updatedAt: Date.now(),
    });

    return;
  }

  // ➡️ Move to next bin
  const nextMaterial = session.bins[nextIndex];

  upsertGuidanceSession({
    ...session,
    currentIndex: nextIndex,
    updatedAt: Date.now(),
  });

  console.log(
    `🧭 Advancing guidance: ${nextIndex + 1}/${session.bins.length}`,
    nextMaterial
  );

  await pusherServer.trigger(`guidance-${binId}`, "guidance-update", {
    active: true,
    material: nextMaterial,
    imageUrl: session.images[nextMaterial],
    step: nextIndex + 1,
    totalSteps: session.bins.length,
  });
}

/* --------------------------------------------------
   Multi-Guidance Start
-------------------------------------------------- */
async function handleMultiGuidanceMessage(payload: Buffer): Promise<void> {
  const parsed: unknown = JSON.parse(payload.toString());

  if (!isMultiGuidancePayload(parsed)) {
    console.warn("⚠️ Invalid multi-guidance payload:", parsed);
    return;
  }

  const { bins, images } = parsed;

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

  // 🛑 Prevent duplicate guidance restarts
  const existing = getGuidanceSession(binId);
  if (existing) {
    console.log("🧭 Guidance already active — ignoring duplicate start");
    return;
  }

  console.log("🧭 Starting multi-guidance for bin:", binId);

  upsertGuidanceSession({
    binId,
    bins,
    images,
    currentIndex: 0,
    updatedAt: Date.now(),
  });

  const currentMaterial = bins[0];

  await pusherServer.trigger(`guidance-${binId}`, "guidance-update", {
    active: true,
    material: currentMaterial,
    imageUrl: images[currentMaterial],
    step: 1,
    totalSteps: bins.length,
  });
}

/* --------------------------------------------------
   MQTT Connection
-------------------------------------------------- */
const connectMqtt = (): Promise<MqttClient> => {
  if (client && client.connected) return Promise.resolve(client);

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
      client!.subscribe("srb/heartbeat/#");
      client!.subscribe("srb/health/#");
      client!.subscribe("srb/ui/multi");

      console.log("📡 MQTT subscriptions ready");
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

  /* --------------------------------------------------
     MQTT Message Router
  -------------------------------------------------- */
  client.on("message", async (topic, payload) => {
    try {
      // 🧭 Advance guidance ONLY on real bin topics
      if (/^srb\/(plastic|paper|metal|ewaste|general)\/.+$/.test(topic)) {
        const data = JSON.parse(payload.toString());
        if (data?.command === "closedetection") {
          const binId = topic.split("/")[2];
          if (binId) {
            console.log("🧭 Bin closed → advancing guidance:", binId);
            await advanceGuidance(binId);
          }
          return;
        }
      }

      // 🛠 Diagnostics
      if (topic.startsWith("srb/health/")) {
        const json = JSON.parse(payload.toString());
        const binId = topic.split("/")[2];
        if (binId) await handleBinDiagnostic(binId, json);
        return;
      }

      // 🆕 Multi-detect UI trigger
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

/* --------------------------------------------------
   Publish Helper
-------------------------------------------------- */
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