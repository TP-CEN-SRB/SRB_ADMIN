import Link from "next/link";
import React from "react";

interface RedirectProps {
  href: string;
  children: React.ReactNode;
}

const FormRedirect = ({ href, children }: RedirectProps) => {
  return (
    <div className="flex justify-center mt-3">
      <Link className="link-underline" href={href}>
        {children}
      </Link>
    </div>
  );
};

export default FormRedirect;
