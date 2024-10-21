import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CardButtonProps {
  href: string;
  children: ReactNode;
}
const CardButton = ({ href, children }: CardButtonProps) => {
  return (
    <div className="mt-8 text-center">
      <Button
        asChild
        className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-6 px-6 min-w-56 rounded-full transition-all"
      >
        <Link href={href}>{children}</Link>
      </Button>
    </div>
  );
};

export default CardButton;
