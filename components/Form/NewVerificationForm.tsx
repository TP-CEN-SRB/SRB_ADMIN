"use client";
import { IoRocket } from "react-icons/io5";
import { useState, useTransition } from "react";
import { verifyToken } from "@/app/action/verification-tokens";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Card from "@/components/Card/Card";
import { MdVerified } from "react-icons/md";
import { MdError } from "react-icons/md";
import CardHeader from "../Card/CardHeader";
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
    <Card fullWidth rounded>
      {!success && !error && (
        <div className="flex flex-col items-center text-center">
          <IoRocket size={100} className="text-slate-500" />
          <CardHeader>Almost there</CardHeader>
          <p className="text-slate-600 mt-2">
            Just click the button below to activate your account.
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
            type="submit"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Verify my email"}
          </Button>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center text-center">
          <MdError size={100} className="text-red-500" />
          <h1 className="text-4xl text-slate-800">Verification Fail</h1>
          <p className="text-slate-600 mt-2">{error}</p>
          <p className="text-slate-600 mt-2">Please try again</p>
        </div>
      )}
      {success && (
        <div className="flex flex-col items-center text-center">
          <MdVerified size={100} className="text-green-500" />
          <h1 className="text-4xl text-slate-800">Verification Success</h1>
          <p className="text-slate-600 mt-2">{success}</p>
        </div>
      )}
    </Card>
  );
};

export default NewVerificationForm;
