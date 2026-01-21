"use client";

import React, { useTransition, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Confetti from "react-confetti";

import { NewAdminPasswordSchema } from "@/schemas/auth";
import { newPassword } from "@/app/action/user";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "@/components/Card/Card";
import CardHeader from "@/components/Card/CardHeader";

import { Loader2 } from "lucide-react";
import { MdLockReset, MdError, MdVerified } from "react-icons/md";

interface NewPasswordFormProps {
  token: string;
  email: string;
  redirect?: string;
}

type ViewState = "form" | "error" | "info" | "success";

const DEFAULT_REDIRECT = "https://tp-cen-srb.github.io/RecycleTP/";
const REDIRECT_SECONDS = 3;
const RESEND_COOLDOWN_SECONDS = 30;
const CLOCK_PAGE_COOLDOWN = 5;

const NewPasswordForm = ({ token, email, redirect }: NewPasswordFormProps) => {
  const redirectUrl = redirect || DEFAULT_REDIRECT;

  const form = useForm<z.infer<typeof NewAdminPasswordSchema>>({
    resolver: zodResolver(NewAdminPasswordSchema),
    defaultValues: { password: "" },
  });

  const [view, setView] = useState<ViewState>("form");
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();

  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [clockCooldown, setClockCooldown] = useState(0);

  /* --------------------------- SUBMIT NEW PASSWORD --------------------------- */

  const onSubmit = (values: z.infer<typeof NewAdminPasswordSchema>) => {
    startTransition(async () => {
      setError(undefined);
      setInfo(undefined);

      const res = await newPassword(values, token);

      if (res?.success) {
        setView("success");
      } else {
        setError(res?.error || "Reset link is invalid or expired.");
        setView("error");
      }
    });
  };

  /* ------------------------------ RESEND EMAIL ------------------------------ */

  const handleResend = async () => {
    if (
      isResending ||
      resendCooldown > 0 ||
      clockCooldown > 0
    )
      return;

    setIsResending(true);
    setError(undefined);
    setInfo(undefined);

    try {
      const res = await fetch("/api/resend-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429) {
          setInfo(
            "A reset email was already sent recently. Please check your inbox or wait before requesting another one."
          );
          setClockCooldown(CLOCK_PAGE_COOLDOWN);
          setView("info");
          return;
        }

        setError(data?.error || "Failed to resend reset email.");
        setView("error");
        return;
      }

      setInfo(
        "If the account exists, a new reset email has been sent. Please check your inbox."
      );
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setView("info");
    } catch {
      setError("Failed to resend reset email. Please try again later.");
      setView("error");
    } finally {
      setIsResending(false);
    }
  };

  /* ---------------------------- COOLDOWN TIMERS ---------------------------- */

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(
      () => setResendCooldown((c) => c - 1),
      1000
    );

    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (clockCooldown <= 0) return;

    const timer = setInterval(
      () => setClockCooldown((c) => c - 1),
      1000
    );

    return () => clearInterval(timer);
  }, [clockCooldown]);

  /* ----------------------------- REDIRECT TIMER ----------------------------- */

  useEffect(() => {
    if (view !== "success") return;

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
  }, [view, redirectUrl]);

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <Card fullWidth rounded>
      {view === "success" && <Confetti numberOfPieces={200} recycle={false} />}

      {/* FORM */}
      {view === "form" && (
        <div className="flex flex-col items-center space-y-3">
          <MdLockReset size={96} className="text-slate-500" />
          <CardHeader>Reset password</CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="At least 8 characters"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be your new password
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                type="submit"
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPending ? "Resetting..." : "Reset my password"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* ERROR */}
      {view === "error" && (
        <div className="flex flex-col items-center text-center space-y-3">
          <MdError size={96} className="text-red-500" />
          <h2 className="text-2xl font-semibold text-slate-800">
            Reset Failed
          </h2>
          <p className="text-slate-600 max-w-sm">{error}</p>

          <Button
            onClick={handleResend}
            variant="outline"
            disabled={
              isResending ||
              resendCooldown > 0 ||
              clockCooldown > 0
            }
          >
            {isResending
              ? "Checking..."
              : resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : clockCooldown > 0
              ? `Please wait ${clockCooldown}s`
              : "Resend reset email"}
          </Button>
        </div>
      )}

      {/* INFO (CLOCK PAGE) */}
      {view === "info" && (
        <div className="flex flex-col items-center text-center space-y-3">
          <MdVerified size={96} className="text-amber-500" />
          <h2 className="text-2xl font-semibold text-slate-800">
            Check Your Email
          </h2>
          <p className="text-slate-600 max-w-sm">{info}</p>

          <Button
            onClick={handleResend}
            variant="outline"
            disabled={
              isResending ||
              resendCooldown > 0 ||
              clockCooldown > 0
            }
          >
            {resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : clockCooldown > 0
              ? `Please wait ${clockCooldown}s`
              : "Resend reset email"}
          </Button>

          <p className="text-xs text-slate-400">
            Tip: check spam or promotions folder
          </p>
        </div>
      )}

      {/* SUCCESS */}
      {view === "success" && (
        <div className="flex flex-col items-center text-center space-y-3">
          <MdVerified size={96} className="text-emerald-500" />
          <h2 className="text-2xl font-semibold text-slate-800">
            Password Reset 🎉
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

export default NewPasswordForm;
