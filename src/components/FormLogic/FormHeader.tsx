import Image from "next/image";
import React, { ReactNode } from "react";

const FormHeader = ({ children }: { children: ReactNode }) => {
  return (
    <h1 className="mb-4 font-extrabold text-slate-800 text-4xl">
      <Image
        src="/temasekPolyBanner.png"
        alt="Temasek Polytechnic"
        width="150"
        height="100"
        className="mb-3"
      />
      {children}
    </h1>
  );
};

export default FormHeader;
