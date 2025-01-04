"use client";
import React, { useState } from "react";
import { connectMqtt, publishMqtt } from "@/lib/mqtt";

const TestPage = () => {
  const [message, setMessage] = useState("");
  const client = connectMqtt();

  const publishMessage = () => {
    publishMqtt(client, message);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>MQTT Publish Example</h1>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button
        onClick={publishMessage}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Publish
      </button>
    </div>
  );
};

export default TestPage;
