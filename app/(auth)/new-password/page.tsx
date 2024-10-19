import NewPasswordForm from "@/components/Form/NewPasswordForm";
import React from "react";

const NewPasswordPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  return <NewPasswordForm token={searchParams.token} />;
};

export default NewPasswordPage;
