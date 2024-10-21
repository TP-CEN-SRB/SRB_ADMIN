"use client";
import React, { useTransition, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ResetSchema } from "@/schemas";
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
import { resetPassword } from "@/app/action/user";
import FormHeader from "./FormHeader";
import CustomFormMessage from "./CustomFormMessage";
import { toast } from "@/hooks/use-toast";
import Card from "../Card/Card";

const ResetPasswordForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await resetPassword(values);
      setError(data?.error as string);
      setSuccess(data?.success as string);
      if (!data?.error) {
        toast({
          title: "Hey there!",
          description: `A reset password email has been sent to ${values.email}`,
        });
      }
    });
  };
  return (
    <Card fullWidth>
      <FormHeader>Forgot Password</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="johndoe@tp.edu.sg"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormDescription>
                  We will send you an email to reset password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">{success}</CustomFormMessage>
          )}
          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Send email"}
          </Button>
        </form>
      </Form>
      <FormRedirect href="/login">Back to login</FormRedirect>
    </Card>
  );
};

export default ResetPasswordForm;
