"use client";
import { updateAdminEmail } from "@/app/action/user";
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
import { toast } from "sonner"
import { UpdateAdminEmailSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CustomFormMessage from "../CustomFormMessage";
import { Loader2 } from "lucide-react";

const EditAdminEmailForm = ({
  handleDialogOpen,
}: {
  handleDialogOpen: () => void;
}) => {
  const form = useForm<z.infer<typeof UpdateAdminEmailSchema>>({
    resolver: zodResolver(UpdateAdminEmailSchema),
    defaultValues: {
      email: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const onSubmit = (values: z.infer<typeof UpdateAdminEmailSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await updateAdminEmail(values);
      setError(data?.error as string);
      if (!data?.error && data?.success !== undefined) {
        handleDialogOpen();
        toast.success("success!",{
          description: `A verification email has been sent to ${values.email.toLowerCase()}`,
        });
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-slate-700">
                New Email
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
                  placeholder="********"
                  {...field}
                  type="password"
                />
              </FormControl>
              <FormDescription>
                Enter your password to confirm this change
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <Button
          disabled={isPending}
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
          {isPending ? "Loading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default EditAdminEmailForm;
