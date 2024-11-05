import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface CardButtonProps {
  href: string;
  children: ReactNode;
  disabled?: boolean;
  color: "blue" | "red" | "green" | "orange";
}

const CardButton = ({
  href,
  children,
  disabled = false,
  color,
}: CardButtonProps) => {
  const colorVariants = {
    blue: "bg-blue-500 hover:bg-blue-600",
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600 ",
    orange: "bg-orange-500 hover:bg-orange-600",
  };
  return (
    <div className="mt-4 text-center">
      <Button
        asChild
        className={`${disabled ? "cursor-not-allowed" : ""} ${
          colorVariants[color]
        } text-white text-lg font-semibold p-6 min-w-56 rounded-full transition-all`}
      >
        {disabled ? (
          <span>
            {disabled ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              children
            )}
            {disabled && "Waiting..."}
          </span>
        ) : (
          <Link href={href}>{children}</Link>
        )}
      </Button>
    </div>
  );
};

export default CardButton;
