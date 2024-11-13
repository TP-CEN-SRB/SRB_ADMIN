import React, { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}
const Card = ({ children, fullWidth = false, rounded = false }: CardProps) => {
  return (
    <div
      className={`card ${fullWidth ? "w-full" : ""}  ${
        rounded ? "rounded-lg" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default Card;
