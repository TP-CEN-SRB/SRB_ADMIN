"use client";
import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SignUpSchema } from "@/schemas";
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
import FormRedirect from "./FormRedirect";
import { signUp } from "@/app/action/user";
import FacultyComboBox from "./FacultyCombobox";
import FormHeader from "./FormHeader";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "./CustomFormMessage";

const SignUpForm = () => {
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await signUp(values);
      setError(data.error);
      if (!data.error) {
        toast({
          title: "Success",
          description: "Account created! You can now log in.",
        });
      }
    });
  };
  return (
    <div className="w-full p-5 shadow-lg rounded-md">
      <FormHeader>Sign Up</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
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
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Faculty</FormLabel>
                <FormControl>
                  <FacultyComboBox field={field} />
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
                <FormLabel>Password</FormLabel>
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
          <Button disabled={isPending} className="w-full" type="submit">
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
