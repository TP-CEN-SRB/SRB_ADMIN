import SignUpBinForm from "@/components/Form/AdminUserForms/SignUpBinForm";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";

const CreateBinManagerPage = () => {
  const user = getSessionUser();
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <SignUpBinForm />
    </div>
  );
};

export default CreateBinManagerPage;
