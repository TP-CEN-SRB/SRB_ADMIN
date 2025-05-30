import NewVerificationForm from "@/components/Form/AuthForms/NewVerificationForm";
import React from "react";

const NewVerificationPage = ({
  params,
}: {
  params: { token: string };
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <NewVerificationForm token={params.token} />
    </div>
  );
};

export default NewVerificationPage;
