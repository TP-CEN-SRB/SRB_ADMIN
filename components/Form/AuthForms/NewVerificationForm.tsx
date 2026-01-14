"use client";

import { IoRocket } from "react-icons/io5";
import { useState, useTransition, useEffect } from "react";
import { verifyToken } from "@/app/action/verification-tokens";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card/Card";
import { MdVerified, MdError } from "react-icons/md";
import CardHeader from "@/components/Card/CardHeader";

interface VerificationFormProps {
  token: string;
}

const REDIRECT_URL = "https://tp-cen-srb.github.io/RecycleTP/";
const REDIRECT_SECONDS = 3;

const NewVerificationForm = ({ token }: VerificationFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [isPending, startTransition] = useTransition();

  // Verify token
  const handleSubmit = () => {
    startTransition(async () => {
      setError(undefined);
      const data = await verifyToken(token);
      setError(data?.error as string);
      setSuccess(data?.success as string);
    });
  };

  const handleResend = async () => {
  try {
    await fetch("/api/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    setError(undefined);
    setSuccess("A new verification email has been sent. Please check your inbox.");
  } catch {
    setError("Failed to resend verification email. Please try again later.");
  }
};

  // ⏱ Countdown + redirect after success
  useEffect(() => {
    if (!success) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [success]);

  return (
    <Card fullWidth rounded>
      {/* INITIAL STATE */}
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
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-gray-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Verifying..." : "Verify my email"}
          </Button>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="flex flex-col items-center text-center">
          <MdError size={100} className="text-red-500" />
          <h1 className="text-4xl text-slate-800">Verification Failed</h1>
          <p className="text-slate-600 mt-2">{error}</p>

          {/* 🔁 Resend button */}
          <Button
            onClick={handleResend}
            variant="outline"
            className="mt-4"
          >
            Resend verification email
          </Button>

          <p className="text-xs text-slate-400 mt-3">
            A new link will be sent if your account is not yet verified.
          </p>
        </div>
      )}

      {/* SUCCESS + REDIRECT */}
      {success && (
        <div className="flex flex-col items-center text-center">
          <MdVerified size={100} className="text-green-500" />
          <h1 className="text-4xl text-slate-800">Email Verified 🎉</h1>
          <p className="text-slate-600 mt-2">{success}</p>

          <div className="flex items-center gap-2 mt-4 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              Redirecting to the app in <strong>{countdown}</strong>s…
            </span>
          </div>

          {/* 🔗 Manual fallback link */}
          <a
            href={REDIRECT_URL}
            className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 underline"
          >
            Open the app now
          </a>

          <p className="text-xs text-slate-400 mt-2">
            If nothing happens, you may close this page.
          </p>
        </div>
      )}
    </Card>
  );
};

export default NewVerificationForm;
