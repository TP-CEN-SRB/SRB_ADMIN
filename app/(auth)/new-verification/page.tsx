import NewVerificationForm from "@/components/Form/AuthForms/NewVerificationForm";
import React from "react";

const NewVerificationPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const token = searchParams?.token ?? "";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        Invalid verification link.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <NewVerificationForm token={token} />
    </div>
  );
};

export default NewVerificationPage;