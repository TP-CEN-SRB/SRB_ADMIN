import Link from "next/link";
import React from "react";

interface RedirectProps {
  href: string;
  children: React.ReactNode;
}

const FormRedirect = ({ href, children }: RedirectProps) => {
  return (
    <div className="text-gray-900 w-full text-center mt-4 hover:underline-offset-2 hover:underline">
      <Link href={href}>{children}</Link>
    </div>
  );
};

export default FormRedirect;
