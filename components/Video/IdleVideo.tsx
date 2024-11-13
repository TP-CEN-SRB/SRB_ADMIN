import React from "react";

const IdleVideo = () => {
  return (
    <video className="w-full h-screen" autoPlay loop playsInline>
      <source src="/tp_video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default IdleVideo;
