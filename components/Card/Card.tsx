import React, { ReactNode } from "react";
interface CardProps {
  children: ReactNode;
  fullWidth?: boolean;
}
const Card = ({ children, fullWidth = false }: CardProps) => {
  return (
    <div
      className={`bg-white p-8 rounded-lg shadow-md ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default Card;
