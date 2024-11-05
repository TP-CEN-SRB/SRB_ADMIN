"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SecondaryPasswordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormMessage from "./CustomFormMessage";
import { Loader2 } from "lucide-react";
import { emptyBinsByUserId } from "@/app/action/bin";

const EmptyBinForm = ({ userId }: { userId: string }) => {
  const form = useForm<z.infer<typeof SecondaryPasswordSchema>>({
    resolver: zodResolver(SecondaryPasswordSchema),
    defaultValues: {
      secondaryPassword: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const onSubmit = (values: z.infer<typeof SecondaryPasswordSchema>) => {
    startTransition(async () => {
      const validatedFields = SecondaryPasswordSchema.safeParse(values);
      if (validatedFields.success) {
        const data = await emptyBinsByUserId(
          userId,
          validatedFields.data.secondaryPassword
        );
        setError(data?.error as string);
        setSuccess(data?.success as string);
      }
    });
  };
  return (
    <div className="flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="secondaryPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    className="text-3xl"
                    pattern={REGEXP_ONLY_DIGITS}
                    maxLength={6}
                    {...field}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={1} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={2} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={3} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={4} className="w-12 h-12 text-2xl" />
                      <InputOTPSlot index={5} className="w-12 h-12 text-2xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">{success}</CustomFormMessage>
          )}
          <div className="text-center">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold p-6 min-w-56 rounded-full transition-all"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                ""
              )}
              {isPending ? "Loading..." : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EmptyBinForm;
