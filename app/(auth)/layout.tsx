import React from "react";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className=" min-h-screen flex items-center container mx-auto max-w-screen-xs">
      {children}
    </div>
  );
};

export default AuthLayout;
