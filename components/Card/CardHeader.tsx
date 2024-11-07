import React, { ReactNode } from "react";

const CardHeader = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-4xl text-slate-800 text-center">{children}</h1>;
};

export default CardHeader;
