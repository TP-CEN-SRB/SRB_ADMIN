import Image from "next/image";
import React, { ReactNode } from "react";
interface UserCardProps {
  children: ReactNode;
  fullWidth?: boolean;
}
const UserCard = ({ children, fullWidth = false }: UserCardProps) => {
  return (
    <div className={`card rounded-lg relative ${fullWidth ? "w-full" : ""}`}>
      <div className="absolute rounded-full -top-[75px] left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-[var(--pale-mint)] p-3">
        <Image
          src="/user.png"
          width="50"
          height="50"
          alt="QR code"
          className=""
        />
      </div>
      {children}
    </div>
  );
};

export default UserCard;
