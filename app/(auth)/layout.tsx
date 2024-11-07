import React from "react";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="bg-[var(--pastel-green)]">{children}</div>;
};

export default AuthLayout;
