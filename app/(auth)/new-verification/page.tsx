import NewVerificationForm from "@/components/Form/AuthForms/NewVerificationForm";
import prisma from "@/lib/db";
import React from "react";

const NewVerificationPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const token = searchParams?.token ?? "";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Invalid verification link.
      </div>
    );
  }

  // 🔐 Securely fetch email from token
const verificationToken = await prisma.verificationToken.findFirst({
  where: { token },
});

if (!verificationToken) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      This verification link is invalid or has expired.
      <br />
      Please request a new verification email.
    </div>
  );
}

const hasExpired = new Date(verificationToken.expires) < new Date();

if (hasExpired) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      This verification link has expired.
      <br />
      Please request a new verification email.
    </div>
  );
}


  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <NewVerificationForm
        token={token}
        email={verificationToken.email}
      />
    </div>
  );
};

export default NewVerificationPage;
