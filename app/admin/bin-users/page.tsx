import SignUpBinForm from "@/components/Form/SignUpBinForm";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";

const BinRolePage = () => {
  const user = getSessionUser();
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <SignUpBinForm />
    </div>
  );
};

export default BinRolePage;
