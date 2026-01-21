"use client";

import React, { useState, useTransition, useEffect } from "react";
import { IoRocket } from "react-icons/io5";
import { MdVerified, MdError } from "react-icons/md";
import { Loader2 } from "lucide-react";
import Confetti from "react-confetti";

import { verifyToken } from "@/app/action/verification-tokens";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card/Card";
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

  /* -------------------------------- VERIFY -------------------------------- */

  const handleVerify = () => {
    startTransition(async () => {
      setError(undefined);
      setInfo(undefined);

      const res = await verifyToken(token);

      if (res?.success) {
        setVerified(true);
      } else {
        setError(res?.error || "Invalid or expired verification link.");
      }
    });
  };

  /* -------------------------------- RESEND -------------------------------- */

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
        setError(data?.error || "Failed to resend verification email.");
        return;
      }

      // ✅ Always start cooldown on success
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

  /* ------------------------------ COOLDOWN TIMER ------------------------------ */

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(
      () => setResendCooldown((c) => c - 1),
      1000
    );

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* ------------------------------ REDIRECT TIMER ------------------------------ */

  useEffect(() => {
    if (!verified) return;

    setCountdown(REDIRECT_SECONDS);

    const interval = setInterval(
      () => setCountdown((c) => c - 1),
      1000
    );

    const timeout = setTimeout(() => {
      window.location.href = redirectUrl;
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [verified, redirectUrl]);

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <Card fullWidth rounded>
      {/* 🎉 CONFETTI */}
      {verified && <Confetti numberOfPieces={250} recycle={false} />}

      {/* INITIAL */}
      {!verified && !error && !info && (
        <div className="flex flex-col items-center text-center space-y-3">
          <IoRocket size={96} className="text-slate-500" />
          <CardHeader>Almost there</CardHeader>
          <p className="text-slate-600">
            Just one more step to activate your account.
          </p>

          <Button
            onClick={handleVerify}
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Verifying..." : "Verify my email"}
          </Button>
        </div>
      )}

      {/* ERROR / INFO */}
      {!verified && (error || info) && (
        <div className="flex flex-col items-center text-center space-y-3">
          {error ? (
            <MdError size={96} className="text-red-500" />
          ) : (
            <MdVerified size={96} className="text-emerald-500" />
          )}

          <h2 className="text-2xl font-semibold text-slate-800">
            {error ? "Verification Failed" : "Email Sent"}
          </h2>

          <p className="text-slate-600 max-w-sm">{error || info}</p>

          <Button
            onClick={handleResend}
            variant="outline"
            className="mt-2"
            disabled={isResending || resendCooldown > 0}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Resend verification email"}
          </Button>

          <p className="text-xs text-slate-400">
            A new link will be sent if your account is not yet verified.
          </p>
        </div>
      )}

      {/* SUCCESS */}
      {verified && (
        <div className="flex flex-col items-center text-center space-y-3">
          <MdVerified size={96} className="text-emerald-500" />
          <h2 className="text-2xl font-semibold text-slate-800">
            Email Verified 🎉
          </h2>

          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              Redirecting in <strong>{countdown}</strong>s…
            </span>
          </div>

          <a
            href={redirectUrl}
            className="text-sm text-emerald-600 underline"
          >
            Go now
          </a>
        </div>
      )}
    </Card>
  );
};

export default NewVerificationForm;
