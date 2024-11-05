import React from "react";
import Header from "./header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full">
      <Header />
      <div className="mt-24">{children}</div>
    </div>
  );
}
