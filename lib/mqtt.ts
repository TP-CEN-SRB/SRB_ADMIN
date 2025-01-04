import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

const connectMqtt = () => {
  if (client) {
    return client;
  }
  client = mqtt.connect(process.env.NEXT_PUBLIC_BROKER_URL!, {
    keepalive: 30,
    connectTimeout: 10 * 1000, // 10 seconds
  });

  client.on("connect", () => console.log("Connected to broker"));
  client.on("error", (error) => {
    console.log("Error: ", error);
    client?.end();
  });

  return client;
};

const publishMqtt = (client: MqttClient, message: string) => {
  if (!client.connected) {
    console.log("Client not connected");
    return false;
  }
  client.publish("test/topic/smartbin", message, { qos: 0 }, (err) => {
    if (err) {
      console.log("Error publishing message: ", err);
      return false;
    } else {
      return true;
    }
  });
};
export { connectMqtt, publishMqtt };
