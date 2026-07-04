"use client";

import React, { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { toast } from "sonner"
import { saveRecording } from "@/app/action/video";

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

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      username: MQTT_USER,
      password: MQTT_PASS,
      reconnectPeriod: 1000,
    });

    setMqttClient(client);

    client.on("connect", () => {
      console.log("🔌 Connected to MQTT");
      toast("Connected to MQTT Broker ✅");

      client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
          console.log("📡 Subscribed to topic");
          toast(`Subscribed to ${MQTT_TOPIC}`);
          client.publish(MQTT_TOPIC, JSON.stringify({ command: "URL" }));
        }
      });
    });

    client.on("message", async (_topic, message) => {
      try {
        const payload = JSON.parse(message.toString());

        if (payload.url && payload.url.includes("trycloudflare.com")) {
          setStreamUrl(payload.url);
          toast("Live stream URL received ✅");
        }

        if (payload.type === "recorded" && payload.url) {
          const result = await saveRecording(payload.url, payload.duration);

          if (result?.error) {
            toast.error( "❌ Failed to Save",{
              description: result.error,
            });
          } else {
            toast("✅ Recording Complete",{
              description: `🕒 Total duration: ${payload.duration} seconds`,
            });
          }
        }
      } catch (err) {
        console.error("❌ MQTT payload error:", err);
        toast.error("MQTT Error",{
          description: "Received invalid data",
        });
      }
    });

    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    if (!recording || !recordStart) return;

    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - recordStart) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [recording, recordStart]);

  const handleToggleRecording = () => {
    if (!mqttClient) return;

    const command = recording ? "stop_record" : "start_record";
    mqttClient.publish(MQTT_TOPIC, JSON.stringify({ command }));

    if (recording) {
      toast("Recording stopped ⏹️");
      setRecording(false);
      setRecordStart(null);
      setDuration(0);
    } else {
      toast("Recording started ⏺️");
      setRecording(true);
      setRecordStart(Date.now());
    }
  };

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Live Surveillance Stream</h1>
          <p className="text-sm text-muted-foreground">
            Real-time view from smart bin camera
          </p>
        </div>
        <button
          onClick={handleToggleRecording}
          className={`px-4 py-2 text-white rounded-lg font-semibold ${
            recording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {recording && (
        <p className="text-center font-mono text-yellow-500">
          ⏺️ Recording... {duration}s elapsed
        </p>
      )}

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
