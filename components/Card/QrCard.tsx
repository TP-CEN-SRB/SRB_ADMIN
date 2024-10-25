import Image from "next/image";
import React, { ReactNode } from "react";
interface QrCardProps {
  children: ReactNode;
  fullWidth?: boolean;
}
const QrCard = ({ children, fullWidth = false }: QrCardProps) => {
  return (
    <div
      className={`bg-white p-8 rounded-lg shadow-md relative ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <div className="absolute rounded-full -top-[75px] left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white p-3">
        <Image src="/qr_code.png" width="50" alt="QR code" className="" />
      </div>
      {children}
    </div>
  );
};

export default QrCard;
