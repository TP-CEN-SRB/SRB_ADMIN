import React from "react";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-screen flex items-center justify-center container mx-auto max-w-screen-lg">
      {children}
    </div>
  );
};

export default DashboardLayout;
