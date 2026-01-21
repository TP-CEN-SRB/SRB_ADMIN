"use client";

import React, { useTransition, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const DEFAULT_REDIRECT = "https://tp-cen-srb.github.io/RecycleTP/";
const REDIRECT_SECONDS = 3;
const RESEND_COOLDOWN_SECONDS = 30;

const NewPasswordForm = ({ token, email,redirect }: NewPasswordFormProps) => {
  const form = useForm<z.infer<typeof NewAdminPasswordSchema>>({
    resolver: zodResolver(NewAdminPasswordSchema),
    defaultValues: { password: "" },
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | undefined>();
  const [isResending, setIsResending] = useState(false);

  const redirectUrl = redirect || DEFAULT_REDIRECT;

  // 🔐 Submit new password
  const onSubmit = (values: z.infer<typeof NewAdminPasswordSchema>) => {
    startTransition(async () => {
      setError(undefined);
      setSuccess(undefined);

      const data = await newPassword(values, token);

      if (data?.success) {
        setSuccess(data.success);
      } else {
        setError(data?.error || "Reset link is invalid or expired.");
      }
    });
  };

  // 🔁 Resend reset email
  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;

    try {
      setIsResending(true);
      setError(undefined);

      const res = await fetch("/api/resend-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError("Please wait before requesting another reset email.");
          return;
        }
        throw new Error();
      }

      setResendMessage(
        "A new reset password email has been sent. Please check your inbox."
      );
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("Failed to resend reset email. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };



  // ⏳ Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ⏱ Redirect after success
  useEffect(() => {
    if (!success) return;

    const interval = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.href = redirectUrl;
    }, REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [success, redirectUrl]);

  return (
    <Card fullWidth rounded>
      {/* FORM */}
      {!error && !success && (
        <div>
          <div className="flex flex-col items-center mb-3">
            <MdLockReset size={100} className="text-slate-500" />
            <CardHeader>Reset password</CardHeader>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
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
      {error && !success && (
        <div className="flex flex-col items-center text-center">
          <MdError size={100} className="text-red-500" />
          <h1 className="text-3xl text-slate-800">Reset Failed</h1>
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
              : "Resend reset email"}
          </Button>

          {resendMessage && (
            <p className="text-green-600 text-sm mt-3">{resendMessage}</p>
          )}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="flex flex-col items-center text-center">
          <MdVerified size={100} className="text-green-500" />
          <h1 className="text-3xl text-slate-800">Password Reset 🎉</h1>
          <p className="text-slate-600 mt-2">{success}</p>

          <div className="flex items-center gap-2 mt-4 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              Redirecting in <strong>{countdown}</strong>s…
            </span>
          </div>

          <a
            href={redirectUrl}
            className="mt-3 text-sm text-emerald-600 underline"
          >
            Go now
          </a>
        </div>
      )}
    </Card>
  );
};

export default NewPasswordForm;
