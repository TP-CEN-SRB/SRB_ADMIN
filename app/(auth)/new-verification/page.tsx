import NewVerificationForm from "@/components/Form/NewVerificationForm";
import React from "react";

const NewVerificationPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  return (
    <div>
      <NewVerificationForm token={searchParams.token} />
    </div>
  );
};

export default NewVerificationPage;
