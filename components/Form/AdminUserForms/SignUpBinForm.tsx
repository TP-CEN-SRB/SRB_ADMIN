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
import FormHeader from "@/components/Form/FormHeader";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "@/components/Form/CustomFormMessage";
import Card from "@/components/Card/Card";
import { signUpBin } from "@/app/action/user";
import FacultyComboBox from "../AuthForms/FacultyCombobox";

const SignUpBinForm = () => {
  const form = useForm<z.infer<typeof SignUpBinSchema>>({
    resolver: zodResolver(SignUpBinSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      location: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = (values: z.infer<typeof SignUpBinSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      setSuccess(""); // clear success message
      const data = await signUpBin(values);
      if (data?.error) {
        setError(data?.error as string);
      }
      if (data?.success) {
        setSuccess(data?.success as string);
        form.reset();
      }
    });
  };
  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Add a bin manager</FormHeader>
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
                  This password will be used for login with the manager
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="Block 1, Level 1 of Engine School"
                    {...field}
                    type="text"
                  />
                </FormControl>
                <FormDescription>
                  This will be the location of the bin(s)
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
    </Card>
  );
};

export default SignUpBinForm;
