"use client";
import React from "react";
import { SyncLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <SyncLoader color="var(--olive-green)" />
    </div>
  );
};

export default Loading;
