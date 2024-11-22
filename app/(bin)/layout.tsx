import React from "react";

const BinLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="bg-center bg-hero bg-cover">
      <div className="h-screen flex items-center justify-center container mx-auto max-w-screen-lg p-4">
        {children}
      </div>
    </div>
  );
};

export default BinLayout;
