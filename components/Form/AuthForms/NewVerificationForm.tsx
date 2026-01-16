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
  email: string;
}

const REDIRECT_URL = "https://tp-cen-srb.github.io/RecycleTP/";
const REDIRECT_SECONDS = 3; //seconds
const RESEND_COOLDOWN = 30; //seconds


const NewVerificationForm = ({ token, email }: VerificationFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [verified, setVerified] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // ✅ Verify token (ONLY this sets verified)
  const handleSubmit = () => {
    startTransition(async () => {
      setError(undefined);
      setResendMessage(undefined);

      const data = await verifyToken(token);

      if (data?.success) {
        setVerified(true);
      } else {
        setError(data?.error || "Invalid or expired verification link.");
      }
    });
  };

  // 🔁 Resend verification email
  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;

    try {
      setIsResending(true);
      setError(undefined);

      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError("Please wait before requesting another verification email.");
          return;
        }
        throw new Error();
      }

      setResendMessage(
        "A new verification email has been sent. Please check your inbox."
      );

      setResendCooldown(RESEND_COOLDOWN);
    } catch {
      setError("Failed to resend verification email. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };


  useEffect(() => {
  if (resendCooldown <= 0) return;

  const timer = setInterval(() => {
    setResendCooldown((c) => c - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [resendCooldown]);

  // ⏱ Redirect ONLY after successful verification
  useEffect(() => {
    if (!verified) return;

    const interval = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [verified]);

  return (
    <Card fullWidth rounded>
      {/* INITIAL STATE */}
      {!verified && !error && !resendMessage && (
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
      {!verified && (error || resendMessage) && (
        <div className="flex flex-col items-center text-center">
          <MdError size={100} className="text-red-500" />
          <h1 className="text-4xl text-slate-800">Verification Failed</h1>
          <p className="text-slate-600 mt-2">{error}</p>

          <Button
            onClick={handleResend}
            variant="outline"
            className="mt-4"
            disabled={isResending || resendCooldown > 0}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Resend verification email"}
          </Button>

          {resendMessage && (
            <p className="text-green-600 text-sm mt-3">{resendMessage}</p>
          )}

          <p className="text-xs text-slate-400 mt-3">
            A new link will be sent if your account is not yet verified.
          </p>
        </div>
      )}

      {/* SUCCESS + REDIRECT */}
      {verified && (
        <div className="flex flex-col items-center text-center">
          <MdVerified size={100} className="text-green-500" />
          <h1 className="text-4xl text-slate-800">Email Verified 🎉</h1>
          <p className="text-slate-600 mt-2">
            Your account has been successfully activated.
          </p>

          <div className="flex items-center gap-2 mt-4 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              Redirecting to the app in <strong>{countdown}</strong>s…
            </span>
          </div>

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
