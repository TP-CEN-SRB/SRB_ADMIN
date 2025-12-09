import React, { ReactNode } from "react";

interface CardProps {
  isAdmin?: boolean;
  rounded?: boolean;
  fullWidth?: boolean;
  className?: string;      // ✅ allow custom classes
  children: React.ReactNode;
}

const Card = ({
  children,
  fullWidth = false,
  rounded = false,
  isAdmin = false,
}: CardProps) => {
  return (
    <div
      className={`${isAdmin ? "admin-card" : "card"} ${
        fullWidth ? "w-full" : ""
      }  ${rounded ? "rounded-lg" : ""}`}
    >
      {children}
    </div>
  );
};

export default Card;
