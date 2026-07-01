import NewPasswordForm from "@/components/Form/AuthForms/NewPasswordForm";
import React from "react";

const NewPasswordPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const token = searchParams?.token ?? "";
  const email = searchParams?.email ?? "";
  const redirect = searchParams?.redirect; // optional

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        Invalid or missing reset link.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <NewPasswordForm
        token={token}
        email={email}
        redirect={redirect}
      />
    </div>
  );
};

export default NewPasswordPage;