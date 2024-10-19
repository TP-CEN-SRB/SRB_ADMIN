"use client";
import React, { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import FormRedirect from "./FormRedirect";
import { newPassword } from "@/app/action/user";
import FormHeader from "./FormHeader";
import CustomFormMessage from "./CustomFormMessage";
interface NewPasswordFormProps {
  token: string;
}

const NewPasswordForm = ({ token }: NewPasswordFormProps) => {
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await newPassword(values, token);
      setError(data?.error as string);
      setSuccess(data?.success as string);
    });
  };
  return (
    <div className="w-full p-5 shadow-lg rounded-md">
      <FormHeader>Reset Password</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="At least 8 characters"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormDescription>
                  This will be your new password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">{success}</CustomFormMessage>
          )}
          {!success && (
            <Button disabled={isPending} className="w-full" type="submit">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                ""
              )}
              {isPending ? "Loading..." : "Reset my password"}
            </Button>
          )}
        </form>
      </Form>
      <FormRedirect href="/login">Back to login</FormRedirect>
    </div>
  );
};

export default NewPasswordForm;
