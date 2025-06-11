"use client";

import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { toast } from "@/hooks/use-toast";

const MQTT_BROKER = "wss://21be7b7891f540b79302d07822b51558.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_TOPIC = "srb/cam";
const MQTT_USER = "raspberrypi_cam";
const MQTT_PASS = "ProjectCEN2M24378";

const VideoStreamPage = () => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordStart, setRecordStart] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Setup MQTT client
  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      username: MQTT_USER,
      password: MQTT_PASS,
      reconnectPeriod: 1000,
    });

    setMqttClient(client);

    client.on("connect", () => {
      console.log("🔌 Connected to MQTT");
      client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
          console.log("📡 Subscribed to topic");
          client.publish(MQTT_TOPIC, JSON.stringify({ command: "URL" }));
        }
      });
    });

    client.on("message", async (_topic, message) => {
      try {
        const payload = JSON.parse(message.toString());

        // Handle stream URL
        if (payload.url && payload.url.includes("trycloudflare.com")) {
          setStreamUrl(payload.url);
        }

        // Handle recorded video
        if (payload.type === "recorded" && payload.url) {
          const res = await fetch("/api/save-recording", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: payload.url,
              duration: payload.duration,
            }),
          });

          if (res.ok) {
            toast({
              title: "✅ Recording Complete",
              description: `🕒 Total duration: ${payload.duration} seconds`,
            });
          } else {
            toast({
              title: "❌ Failed to Save",
              description: "Could not save recording to database",
              variant: "destructive",
            });
          }
        }
      } catch (err) {
        console.error("❌ MQTT payload error:", err);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  // Update duration timer while recording
  useEffect(() => {
    if (!recording || !recordStart) return;

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - recordStart) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [recording, recordStart]);

  // Toggle recording state and publish command
  const handleToggleRecording = () => {
    if (!mqttClient) return;

    const command = recording ? "stop_record" : "start_record";
    mqttClient.publish(MQTT_TOPIC, JSON.stringify({ command }));

    if (recording) {
      setRecording(false);
      setRecordStart(null);
      setDuration(0);
    } else {
      setRecording(true);
      setRecordStart(Date.now());
    }
  };

  return (
    <div className="w-full p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Live Surveillance Stream</h1>
          <p className="text-sm text-muted-foreground">Real-time view from smart bin camera</p>
        </div>
        <button
          onClick={handleToggleRecording}
          className={`px-4 py-2 text-white rounded-lg font-semibold ${
            recording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {/* Recording indicator */}
      {recording && (
        <p className="text-center font-mono text-yellow-500">
          ⏺️ Recording... {duration}s elapsed
        </p>
      )}

      {/* Video Frame */}
      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden border bg-black shadow mx-auto">
        {streamUrl ? (
          <iframe
            ref={iframeRef}
            src={streamUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <div className="text-center text-muted-foreground p-10">
            Waiting for stream...
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStreamPage;
