"use client";
import React, { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas/auth";
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
import { newPassword } from "@/app/action/user";
import { MdLockReset } from "react-icons/md";
import Card from "@/components/Card/Card";
import { MdError, MdVerified } from "react-icons/md";
import CardHeader from "../Card/CardHeader";
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
    <Card fullWidth rounded>
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
                      Password
                    </FormLabel>
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
              {!success && !error && (
                <Button
                  disabled={isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  type="submit"
                >
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
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center">
          <MdError size={100} className="text-red-500" />
          <h1 className="text-4xl text-slate-800">Reset Fail</h1>
          <p className="text-slate-600 mt-2">{error}</p>
          <p className="text-slate-600 mt-2">Please try again</p>
        </div>
      )}
      {success && (
        <div className="flex flex-col items-center ">
          <MdVerified size={100} className="text-green-500" />
          <h1 className="text-4xl text-slate-800">Reset Success</h1>
          <p className="text-slate-600 mt-2">{success}</p>
        </div>
      )}
    </Card>
  );
};

export default NewPasswordForm;
