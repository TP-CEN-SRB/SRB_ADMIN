// lib/mqttHeartbeatSync.ts
import { connect } from "mqtt";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client"; 

const brokerUrl = process.env.MQTT_URL || "mqtts://YOUR_HIVEMQ_URL:8883";
const mqttUser = process.env.MQTT_USERNAME;
const mqttPass = process.env.MQTT_PASSWORD;

let client: ReturnType<typeof connect> | null = null;

export const initMqttHeartbeatSync = () => {
  if (client) return; // prevent multiple connections
  client = connect(brokerUrl, {
    username: mqttUser,
    password: mqttPass,
  });

  client.on("connect", () => {
    console.log("✅ MQTT heartbeat sync connected");
    client?.subscribe("srb/heartbeat/#");
  });

  client.on("message", async (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      // expected payload: { binId: "uuid", timestamp: "2025-11-05T15:00:00Z" }
      if (!data.binId) return;

      const now = new Date(data.timestamp || new Date());

      // 🧠 1️⃣ Determine if bin exists
      const bin = await prisma.bin.findUnique({ where: { id: data.binId } });
      if (!bin) {
        console.warn(`⚠️ Unknown bin ID ${data.binId}, skipping`);
        return;
      }

      // 🟢 2️⃣ Mark bin FUNCTIONAL + update heartbeat
      await prisma.bin.update({
        where: { id: data.binId },
        data: {
          lastHeartBeat: now,
          status: BinStatus.FUNCTIONAL,
        },
      });

      // 🧾 3️⃣ Log uptime snapshot into BinUptimeLog
      await prisma.binUptimeLog.create({
        data: {
          binId: data.binId,
          timestamp: now,
          status: BinStatus.FUNCTIONAL,
        },
      });

      console.log(`📡 Bin ${data.binId} marked FUNCTIONAL @ ${now.toISOString()}`);
    } catch (err) {
      console.error("❌ MQTT heartbeat handler error:", err);
    }
  });

  // 🕒 4️⃣ Periodic offline detector (runs every minute)
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - 10 * 60 * 1000); // 10 min threshold

      // Get bins that haven’t updated in the last 10 min
      const offlineBins = await prisma.bin.findMany({
        where: {
          OR: [
            { lastHeartBeat: null },
            { lastHeartBeat: { lt: cutoff } },
          ],
          status: "FUNCTIONAL", // only downgrade active ones
        },
        select: { id: true },
      });

      if (offlineBins.length === 0) return;

      // Update their status
      await prisma.bin.updateMany({
        where: {
          id: { in: offlineBins.map((b) => b.id) },
        },
        data: { status: "UNDER_MAINTENANCE" },
      });

      // Log them as "UNDER_MAINTENANCE" in uptime logs
      const now = new Date();
      await prisma.binUptimeLog.createMany({
        data: offlineBins.map((b) => ({
          binId: b.id,
          timestamp: now,
          status: "UNDER_MAINTENANCE",
        })),
      });

      console.log(`🔴 ${offlineBins.length} bins marked UNDER_MAINTENANCE`);
    } catch (err) {
      console.error("⚠️ Offline detector error:", err);
    }
  }, 60_000); // check every 1 minute
};
