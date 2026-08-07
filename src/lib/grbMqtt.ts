import mqtt, { MqttClient } from "mqtt"
import { recordGrbWeight } from "@/app/action/grb"

// --- Giant Rubbish Bin (GRB) MQTT bridge ---
// Talks to the PUBLIC HiveMQ broker, entirely separate from the private
// HiveMQ Cloud broker + client in src/lib/mqtt.ts (different host, no auth,
// different topic). Do not merge these - one outage/credential change must
// never affect the other.
//
// The device itself connects over plain TCP (mqtt_server = "broker.hivemq.com",
// port 1883) - that's firmware-side and outside this app. Browsers can't open
// raw TCP sockets, so this client speaks to the same broker over its
// WebSocket listener instead.

const GRB_BROKER_URL =
  process.env.NEXT_PUBLIC_GRB_BROKER_URL ?? "wss://broker.hivemq.com:8884/mqtt"
const GRB_MQTT_TOPIC = process.env.NEXT_PUBLIC_GRB_MQTT_TOPIC ?? "albaewaste"

let client: MqttClient | null = null
let isConnecting = false

// Accepts either a bare number ("4523") or a JSON payload
// ({"weight": 4523} / {"weightInGrams": 4523} / {"grams": 4523} / {"value": 4523}).
// The public broker is unauthenticated and shared, so payloads are treated as
// untrusted input - anything that doesn't resolve to a finite, non-negative
// number is dropped rather than guessed at.
const parseGrbWeight = (raw: string): number | null => {
  const text = raw.trim()
  if (!text) return null

  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === "number") return parsed
    if (parsed && typeof parsed === "object") {
      const candidate =
        parsed.weightInGrams ?? parsed.weight ?? parsed.grams ?? parsed.value
      const num = Number(candidate)
      return Number.isFinite(num) ? num : null
    }
  } catch {
    // Not JSON - fall through to plain-number parsing below.
  }

  const num = Number(text)
  return Number.isFinite(num) ? num : null
}

const connectGrbMqtt = (): Promise<MqttClient> => {
  if (client && client.connected) {
    return Promise.resolve(client)
  }

  if (isConnecting) {
    return new Promise((resolve) => {
      const timer = setInterval(function(){
        if (client?.connected) {
          clearInterval(timer)
          resolve(client)
        }
      }, 200)
    })
  }

  isConnecting = true

  client = mqtt.connect(GRB_BROKER_URL, {
    keepalive: 30,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  })

  client.on("connect", function(){
    console.log("GRB MQTT connected")
    client!.subscribe(GRB_MQTT_TOPIC, { qos: 0 })
    console.log("Subscribed to GRB topic:", GRB_MQTT_TOPIC)
    isConnecting = false
  })

  client.on("error", (err) => {
    console.error("GRB MQTT Error:", err)
    isConnecting = false
  })

  client.on("close", function(){
    console.warn("GRB MQTT disconnected — retrying...")
    isConnecting = false
  })

  client.on("message", async (topic, payload) => {
    if (topic !== GRB_MQTT_TOPIC) return

    try {
      const weightInGrams = parseGrbWeight(payload.toString())
      if (weightInGrams === null) {
        console.warn("⚠️ Unparseable GRB weight payload:", payload.toString())
        return
      }

      await recordGrbWeight(weightInGrams)
    } catch (err) {
      console.error("❌ GRB weight processing error:", err)
    }
  })

  return new Promise((resolve) => {
    client!.once("connect", () => resolve(client!))
  })
}

export { connectGrbMqtt }
