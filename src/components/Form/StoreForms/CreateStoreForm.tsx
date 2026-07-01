"use client";

import React, { useState, useTransition } from "react";
import Card from "@/components/Card/Card";
import FormHeader from "../FormHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "../CustomFormMessage";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { createStore } from "@/app/action/store";

// Faculty enum values
const FacultyEnum = ["ENG", "BUS", "ASC", "IIT", "HSS", "DES", "OTHERS", "EXT"] as const;

// Schema
const StoreSchema = z
  .object({
    name: z.string().min(1, "Store name is required"),
    email: z.string().email("Invalid email"),
    faculty: z.enum(FacultyEnum, {
      errorMap: () => ({ message: "Faculty is required" }),
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const CreateStoreForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof StoreSchema>>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      name: "",
      email: "",
      faculty: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof StoreSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });

    startTransition(async () => {
      setError("");
      setSuccess("");
      const result = await createStore(values);
      if (result?.success) {
        setSuccess("Store created successfully at " + datetime);
        form.reset();
      } else if (result?.error) {
        setError(result.error); // should return duplicate email/name errors
      }
    });
  };

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Create Store Account</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Store Name</FormLabel>
                <FormControl>
                  <Input disabled={isPending} placeholder="EcoMart" {...field} />
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
                <FormLabel className="font-bold text-slate-700">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={isPending}
                    placeholder="store@example.com"
                    {...field}
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
                <FormLabel className="font-bold text-slate-700">Faculty</FormLabel>
                <FormControl>
                  <select
                    disabled={isPending}
                    {...field}
                    className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm"
                  >
                    <option value="">Select a faculty...</option>
                    {FacultyEnum.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
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
                <FormLabel className="font-bold text-slate-700">Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && <CustomFormMessage type="Success">{success}</CustomFormMessage>}

          <Button
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            type="submit"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Creating..." : "Create Store"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CreateStoreForm;
