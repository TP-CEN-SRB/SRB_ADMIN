import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface CardButtonProps {
  href: string;
  children: ReactNode;
  disabled?: boolean;
}
const CardButton = ({ href, children, disabled = false }: CardButtonProps) => {
  return (
    <div className="mt-8 text-center">
      <Button
        asChild
        className={`${
          disabled ? "cursor-not-allowed" : ""
        } bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-6 px-6 min-w-56 rounded-full transition-all`}
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
