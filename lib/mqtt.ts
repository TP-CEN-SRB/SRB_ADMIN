import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

const connectMqtt = (): Promise<MqttClient> => {
  if (client && client.connected) {
    return Promise.resolve(client);
  }

  if (!client) {
    client = mqtt.connect(process.env.NEXT_PUBLIC_BROKER_URL!, {
      username: process.env.NEXT_PUBLIC_BROKER_USERNAME!,
      password: process.env.NEXT_PUBLIC_BROKER_PASSWORD!,
      keepalive: 30,
      connectTimeout: 10 * 1000, // 10 seconds
    });

    client.on("connect", () => console.log("Connected to broker"));
    client.on("error", (error) => {
      console.error("MQTT connection error:", error);
      client?.end();
      client = null;
    });
    client.on("close", () => {
      console.log("MQTT connection closed");
      client = null;
    });
  }
  return new Promise((resolve, reject) => {
    if (client?.connected) {
      resolve(client);
    } else {
      const onConnect = () => {
        client?.off("connect", onConnect);
        client?.off("error", onError);
        resolve(client!);
      };

      const onError = (err: Error) => {
        client?.off("error", onError);
        client?.off("connect", onConnect);
        reject(err);
      };

      client?.once("connect", onConnect);
      client?.once("error", onError);
    }
  });
};

const publishMqtt = async (
  topic: string,
  message: string
): Promise<boolean> => {
  try {
    const mqttClient = await connectMqtt();
    return new Promise((resolve, reject) => {
      mqttClient.publish(topic, message, { qos: 0 }, (err) => {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error("Failed to connect and publish message:", error);
    return false;
  }
};

export { connectMqtt, publishMqtt };
