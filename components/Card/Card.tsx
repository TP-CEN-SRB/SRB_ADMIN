import React, { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  isAdmin?: boolean;
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
