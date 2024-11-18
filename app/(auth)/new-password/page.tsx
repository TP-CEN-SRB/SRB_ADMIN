import NewPasswordForm from "@/components/Form/AuthForms/NewPasswordForm";
import React from "react";

const NewPasswordPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <NewPasswordForm token={searchParams.token} />
    </div>
  );
};

export default NewPasswordPage;
