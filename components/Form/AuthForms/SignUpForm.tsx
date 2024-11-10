"use client";
import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SignUpAdminSchema } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
import FormRedirect from "@/components/Form/FormRedirect";
import { signUp } from "@/app/action/user";
import FacultyComboBox from "@/components/Form/AuthForms/FacultyCombobox";
import FormHeader from "@/components/Form/FormHeader";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "@/components/Form/CustomFormMessage";
import { ToastAction } from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignUpAdminSchema>>({
    resolver: zodResolver(SignUpAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = (values: z.infer<typeof SignUpAdminSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await signUp(values);
      setError(data?.error as string);
      setSuccess(data?.success as string);
      if (!data?.error && data?.success !== undefined) {
        form.reset();
        toast({
          title: "Hey there!",
          description: `A verification email has been sent to ${values.email.toLowerCase()}`,
          action: (
            <ToastAction altText="Login">
              <Button onClick={() => router.push("/login")}>Login</Button>
            </ToastAction>
          ),
        });
      }
    });
  };
  return (
    <div className="auth-card w-full">
      <FormHeader>Sign Up</FormHeader>
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
            name="faculty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Faculty
                </FormLabel>
                <FormControl>
                  <FacultyComboBox disabled={isPending} field={field} />
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
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">{success}</CustomFormMessage>
          )}
          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
            type="submit"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
      <FormRedirect href="/login">Already have an account?</FormRedirect>
    </div>
  );
};

export default SignUpForm;
