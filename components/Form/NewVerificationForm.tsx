"use client";
import { PulseLoader } from "react-spinners";
import FormHeader from "./FormHeader";
import { useCallback, useEffect, useState } from "react";
import { verifyToken } from "@/app/action/verification-tokens";
import CustomFormMessage from "./CustomFormMessage";
import FormRedirect from "./FormRedirect";
interface VerificationFormProps {
  token: string | undefined;
  successStatus: string | undefined;
}
const NewVerificationForm = ({
  token,
  successStatus,
}: VerificationFormProps) => {
  const [error, setError] = useState<String | undefined>();
  const [success, setSuccess] = useState<String | undefined>();
  const onSubmit = useCallback(() => {
    if (successStatus == "true") {
      setSuccess("Email verified");
      return;
    }
    if (!token) {
      setError("Missing token");
      return;
    }
    verifyToken(token).then((data) => {
      setError(data?.error);
    });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
  return (
    <div className="w-full p-5 shadow-lg rounded-md text-center">
      <FormHeader>Verification</FormHeader>
      {!success && !error && (
        <p className="my-3 text-gray-500">Verifying your email...</p>
      )}
      {!success && error && (
        <CustomFormMessage type="Error">{error}</CustomFormMessage>
      )}
      {success && (
        <CustomFormMessage type="Success">{success}</CustomFormMessage>
      )}
      {!success && !error && <PulseLoader size={25} />}
      <FormRedirect href="/login">Back to login</FormRedirect>
    </div>
  );
};

export default NewVerificationForm;
