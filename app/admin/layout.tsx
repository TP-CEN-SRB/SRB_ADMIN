import React from "react";
import Header from "./header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen">
      <Header />
      <div className="mt-24">{children}</div>
    </div>
  );
}
