import NewVerificationForm from "@/components/Form/AuthForms/NewVerificationForm";
import React from "react";

const NewVerificationPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const token = searchParams?.token ?? "";
  const email = searchParams?.email ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <NewVerificationForm token={token} email={email} />
    </div>
  );
};

export default NewVerificationPage;