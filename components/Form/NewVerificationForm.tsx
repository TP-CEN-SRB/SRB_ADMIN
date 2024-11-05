"use client";
import FormHeader from "./FormHeader";
import { useState, useTransition } from "react";
import { verifyToken } from "@/app/action/verification-tokens";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Card from "../Card/Card";
import { MdVerified } from "react-icons/md";
import { MdError } from "react-icons/md";
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
    <Card fullWidth>
      <FormHeader>
        <div className="text-center">Email Verification</div>
      </FormHeader>
      {error && (
        <div className="flex flex-col items-center text-red-700">
          <MdError size={150} />
          <h2 className="text-xl text-center font-semibold">{error}</h2>
        </div>
      )}
      {success && (
        <div className="flex flex-col items-center text-green-500">
          <MdVerified size={150} />
          <h2 className="text-xl text-center font-semibold">{success}</h2>
          <p className="text-gray-500">
            You can continue using the application
          </p>
        </div>
      )}
      {!success && !error && (
        <p className="text-center">You&apos;re almost there!</p>
      )}

      {!success && !error && (
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full mt-4"
          type="submit"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
          {isPending ? "Loading..." : "Verify my email"}
        </Button>
      )}
    </Card>
  );
};

export default NewVerificationForm;
