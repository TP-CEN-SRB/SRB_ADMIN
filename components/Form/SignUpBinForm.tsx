"use client";
import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SignUpBinSchema } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
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
import FormHeader from "./FormHeader";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "./CustomFormMessage";
import { useRouter } from "next/navigation";
import Card from "../Card/Card";
import { signUpBin } from "@/app/action/user";

const SignUpBinForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignUpBinSchema>>({
    resolver: zodResolver(SignUpBinSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      secondaryPassword: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = (values: z.infer<typeof SignUpBinSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await signUpBin(values);
      setError(data?.error as string);
      setSuccess(data?.success as string);
    });
  };
  return (
    <Card rounded fullWidth>
      <FormHeader>Create a bin user</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="John Doe"
                    {...field}
                    type="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="johndoe@tp.edu.sg"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  We will never share your password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondaryPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Secondary Password
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="6 Digit Passcode"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormDescription>
                  This password will be used for actions like signing out
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
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpBinForm;
