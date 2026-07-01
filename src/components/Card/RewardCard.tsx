import React, { ReactNode } from "react";
interface RewardCardProps {
  children: ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}
const RewardCard = ({
  children,
  fullWidth = false,
  rounded = false,
}: RewardCardProps) => {
  return (
    <div
      className={`border border-slate-800 ${fullWidth ? "w-full" : ""}  ${
        rounded ? "rounded-lg" : ""
      } overflow-hidden`}
    >
      {children}
    </div>
  );
};

export default RewardCard;
