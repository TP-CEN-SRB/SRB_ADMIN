import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;
let isConnecting = false;
let subscribed = false;

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
    reconnectPeriod: 5000, // 🔁 auto reconnect every 5 seconds
    connectTimeout: 10_000,
  });

  client.on("connect", () => {
    console.log("MQTT connected");

    // Make sure we only subscribe ONCE
    if (!subscribed) {
      client!.subscribe("srb/heartbeat/#", { qos: 0 });
      subscribed = true;
      console.log("Subscribed to heartbeat topic");
    }

    isConnecting = false;
  });

  client.on("error", (err) => {
    console.error("MQTT Error:", err);
    isConnecting = false;
  });

  client.on("close", () => {
    console.warn("MQTT disconnected — retrying...");
    isConnecting = false;
    subscribed = false;
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
