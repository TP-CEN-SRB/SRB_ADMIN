"use client";
import FormHeader from "./FormHeader";
import { useState, useTransition } from "react";
import { verifyToken } from "@/app/action/verification-tokens";
import CustomFormMessage from "./CustomFormMessage";
import FormRedirect from "./FormRedirect";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
interface VerificationFormProps {
  token: string;
}
const NewVerificationForm = ({ token }: VerificationFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const handleSubmit = () => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await verifyToken(token);
      setError(data?.error as string);
      setSuccess(data?.success as string);
    });
  };
  return (
    <div className="w-full p-5 shadow-lg rounded-md text-center">
      <FormHeader>Verification</FormHeader>
      {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
      {success && (
        <CustomFormMessage type="Success">{success}</CustomFormMessage>
      )}
      {!success && (
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full mt-4"
          type="submit"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
          {isPending ? "Loading..." : "Verify my email now"}
        </Button>
      )}
      <FormRedirect href="/login">Back to login</FormRedirect>
    </div>
  );
};

export default NewVerificationForm;
