import mqtt, { MqttClient } from "mqtt"
import { handleBinDiagnostic } from "@/app/action/bin"

let client: MqttClient | null = null
let isConnecting = false
let subscribed = false

const connectMqtt = (): Promise<MqttClient> => {
  if (client && client.connected) {
    return Promise.resolve(client)
  }

  if (isConnecting) {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (client?.connected) {
          clearInterval(timer)
          resolve(client)
        }
      }, 200)
    })
  }

  isConnecting = true

  client = mqtt.connect(process.env.NEXT_PUBLIC_BROKER_URL!, {
    username: process.env.NEXT_PUBLIC_BROKER_USERNAME!,
    password: process.env.NEXT_PUBLIC_BROKER_PASSWORD!,
    keepalive: 30,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  })

  client.on("connect", () => {
    console.log("MQTT connected")

    if (!subscribed) {
      // Existing heartbeat subscription
      client!.subscribe("srb/heartbeat/#", { qos: 0 })
      console.log("Subscribed to heartbeat topic")

      // NEW — subscribe to diagnostics
      client!.subscribe("srb/health/#", { qos: 0 })
      console.log("Subscribed to diagnostic topic: srb/health/#")

      subscribed = true
    }

    isConnecting = false
  })

  client.on("error", (err) => {
    console.error("MQTT Error:", err)
    isConnecting = false
  })

  client.on("close", () => {
    console.warn("MQTT disconnected — retrying...")
    isConnecting = false
    subscribed = false
  })

  // 🔥 Listen for ALL MQTT messages
  client.on("message", async (topic, payload) => {
    try {
      // Only handle diagnostics here
      if (topic.startsWith("srb/health/")) {
        const json = JSON.parse(payload.toString())

        // Topic format: srb/health/<binId>
        const parts = topic.split("/")
        const binId = parts[2]

        if (!binId) {
          console.warn("⚠️ Diagnostic received without binId:", topic)
          return
        }

        console.log("🛠 Processing diagnostic for bin:", binId)

        await handleBinDiagnostic(binId, json)
      }

    } catch (err) {
      console.error("❌ Diagnostic processing error:", err)
    }
  })

  return new Promise((resolve) => {
    client!.once("connect", () => resolve(client!))
  })
}

export const publishMqtt = async (
  topic: string,
  message: string
): Promise<boolean> => {
  const mqttClient = await connectMqtt()

  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, message, { qos: 0 }, (err) => {
      if (err) return reject(false)
      resolve(true)
    })
  })
}

export { connectMqtt }
