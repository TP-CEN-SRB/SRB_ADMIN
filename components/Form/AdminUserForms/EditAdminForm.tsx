"use client";

import { SignUpAdminSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FacultyComboBox from "@/components/Form/AuthForms/FacultyCombobox";
import FormHeader from "@/components/Form/FormHeader";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "@/components/Form/CustomFormMessage";
import Card from "@/components/Card/Card";
import { Button } from "@/components/ui/button";
import { Faculty } from "@prisma/client";
import { updateAdmin } from "@/app/action/user";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface EditAdminFormProps {
  email: string;
  name: string;
  faculty: Faculty;
}
const EditAdminForm = ({ email, name, faculty }: EditAdminFormProps) => {
  const form = useForm<z.infer<typeof SignUpAdminSchema>>({
    resolver: zodResolver(SignUpAdminSchema.omit({ password: true })),
    defaultValues: {
      name,
      email,
      faculty,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const onSubmit = (values: z.infer<typeof SignUpAdminSchema>) => {
    startTransition(async () => {
      setError(""); // clear error message
      const data = await updateAdmin(values);
      setError(data?.error as string);
      if (!data?.error && data?.success !== undefined) {
        toast({
          title: "Success!",
          description: `Your profile has been updated!`,
        });
        router.push("/admin/profile");
      }
    });
  };
  return (
    <Card rounded fullWidth>
      <FormHeader>Update profile</FormHeader>
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
                    disabled
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
    </Card>
  );
};

export default EditAdminForm;
