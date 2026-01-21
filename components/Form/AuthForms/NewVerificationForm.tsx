"use client";

import { IoRocket } from "react-icons/io5";
import React, { useState, useTransition, useEffect } from "react";
import { verifyToken } from "@/app/action/verification-tokens";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card/Card";
import { MdVerified, MdError } from "react-icons/md";
import CardHeader from "@/components/Card/CardHeader";

interface VerificationFormProps {
  token: string;
  email: string;
  redirect?: string;
}

const DEFAULT_REDIRECT = "https://tp-cen-srb.github.io/RecycleTP/";
const REDIRECT_SECONDS = 3;
const RESEND_COOLDOWN = 30;

const NewVerificationForm = ({ token, email, redirect }: VerificationFormProps) => {
  const redirectUrl = redirect || DEFAULT_REDIRECT;

  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ✅ Verify token
  const handleSubmit = () => {
    startTransition(async () => {
      setError(undefined);
      setInfo(undefined);

      const data = await verifyToken(token);

      if (data?.success) {
        setVerified(true);
      } else {
        setError(data?.error || "Invalid or expired verification link.");
      }
    });
  };

  // 🔁 Resend verification email (FIXED)
  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);
    setError(undefined);
    setInfo(undefined);

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirect: redirectUrl }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429) {
          setError(data?.error || "Please wait before requesting another verification email.");
        } else {
          setError(data?.error || "Failed to resend verification email.");
        }
        return;
      }

      // ✅ SUCCESS → always start cooldown
      setResendCooldown(RESEND_COOLDOWN);
      setInfo(
        "If your account is not yet verified, a new verification email has been sent. Please check your inbox."
      );
    } catch {
      setError("Failed to resend verification email. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  // ⏳ Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ⏱ Redirect after verification
  useEffect(() => {
    if (!verified) return;

    setCountdown(REDIRECT_SECONDS);

    const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
    const timeout = setTimeout(() => {
      window.location.href = redirectUrl;
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [verified, redirectUrl]);

  return (
    <Card fullWidth rounded>
      {/* INITIAL */}
      {!verified && !error && !info && (
        <div className="flex flex-col items-center text-center">
          <IoRocket size={100} className="text-slate-500" />
          <CardHeader>Almost there</CardHeader>
          <p className="text-slate-600 mt-2">
            Just click the button below to activate your account.
          </p>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Verifying..." : "Verify my email"}
          </Button>
        </div>
      )}

      {/* ERROR / INFO */}
      {!verified && (error || info) && (
        <div className="flex flex-col items-center text-center">
          {error ? (
            <MdError size={100} className="text-red-500" />
          ) : (
            <MdVerified size={100} className="text-green-500" />
          )}

          <h1 className="text-3xl text-slate-800">
            {error ? "Verification Failed" : "Email Sent"}
          </h1>

          <p className="text-slate-600 mt-2">{error || info}</p>

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
        </div>
      )}

      {/* SUCCESS */}
      {verified && (
        <div className="flex flex-col items-center text-center">
          <MdVerified size={100} className="text-green-500" />
          <h1 className="text-3xl text-slate-800">Email Verified 🎉</h1>

          <div className="flex items-center gap-2 mt-4 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              Redirecting in <strong>{countdown}</strong>s…
            </span>
          </div>

          <a href={redirectUrl} className="mt-3 text-sm text-emerald-600 underline">
            Go now
          </a>
        </div>
      )}
    </Card>
  );
};

export default NewVerificationForm;
