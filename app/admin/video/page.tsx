"use client";

import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

const MQTT_BROKER = "wss://21be7b7891f540b79302d07822b51558.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_TOPIC = "srb/cam";
const MQTT_USER = "raspberrypi_cam";
const MQTT_PASS = "ProjectCEN2M24378";

const VideoStreamPage = () => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      username: MQTT_USER,
      password: MQTT_PASS,
      reconnectPeriod: 1000,
    });

    client.on("connect", () => {
      console.log("🔌 Connected to MQTT");
      client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
          console.log("📡 Subscribed to topic");
          client.publish(MQTT_TOPIC, JSON.stringify({ command: "URL" }));
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.url && payload.url.includes("trycloudflare.com")) {
          setStreamUrl(payload.url);
        }
      } catch (err) {
        console.error("❌ MQTT payload error:", err);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Live Surveillance Stream</h1>
          <p className="text-sm text-muted-foreground">Real-time view from smart bin camera</p>
        </div>
      </div>

      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border bg-black shadow mx-auto">
        {streamUrl ? (
          <iframe
            ref={iframeRef}
            src={streamUrl}
            width="100%"
            height="100%"
            style={{
              border: "none",
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <div className="text-center text-muted-foreground p-10">Waiting for stream...</div>
        )}
      </div>
    </div>
  );
};

export default VideoStreamPage;
