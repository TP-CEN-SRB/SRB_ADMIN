import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  color: "indigo" | "red" | "amber" | "emerald" | "slate";
  rounded?: boolean;
  variant?: "default" | "outline";
}

const ButtonRedirect = ({
  href,
  children,
  color,
  rounded = false,
  variant = "default",
}: ButtonProps) => {
  const colorVariants = {
    indigo: {
      default: "bg-indigo-500 hover:bg-indigo-600 text-gray-50",
      outline:
        "border border-indigo-500 bg-[var(--pale-mint)] text-indigo-500 hover:bg-indigo-50",
    },
    red: {
      default: "bg-red-500 hover:bg-red-600 text-gray-50",
      outline:
        "border border-red-500 bg-[var(--pale-mint)] text-red-500 hover:bg-red-50",
    },
    amber: {
      default: "bg-amber-500 hover:bg-amber-600 text-gray-50",
      outline:
        "border border-amber-500 bg-[var(--pale-mint)] text-amber-500 hover:bg-amber-50",
    },
    emerald: {
      default: "bg-emerald-500 hover:bg-emerald-600 text-gray-50",
      outline:
        "border border-emerald-500 bg-[var(--pale-mint)] text-emerald-500 hover:bg-emerald-50",
    },
    slate: {
      default: "bg-slate-500 hover:bg-slate-600 text-gray-50",
      outline:
        "border border-slate-500 bg-[var(--pale-mint)] text-slate-500 hover:bg-slate-50",
    },
  };

  return (
    <div className="mt-4 text-center">
      <Button
        asChild
        className={`${
          colorVariants[color][variant]
        } text-xl font-semibold p-6 min-w-56 ${
          rounded ? "rounded-full" : ""
        } transition-colors`}
      >
        <Link href={href}>{children}</Link>
      </Button>
    </div>
  );
};

export default ButtonRedirect;
