"use client";

import Card from "@/components/Card/Card";
import React, { useTransition } from "react";
import FormHeader from "../FormHeader";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UpdateBinFormSchema } from "@/schemas/auth";
import { Faculty } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FacultyComboBox from "../AuthForms/FacultyCombobox";
import { Button } from "@/components/ui/button";
import { updateBinUser } from "@/app/action/user";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditBinFormProps {
  id: string;
  email: string;
  name: string;
  faculty: Faculty;
  location: string;
}

const EditBinForm = ({
  id,
  name,
  email,
  faculty,
  location,
}: EditBinFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<z.infer<typeof UpdateBinFormSchema>>({
    resolver: zodResolver(UpdateBinFormSchema),
    defaultValues: {
      name,
      email,
      faculty,
      location,
    },
  });
  const onSubmit = (values: z.infer<typeof UpdateBinFormSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });
    startTransition(async () => {
      try {
        const result = await updateBinUser(id, values);
        if (result?.success) {
          toast({
            title: `Manager updated at ${datetime}`,
            description: `Manager ${name} has been updated successfully`,
            variant: "default",
          });
          router.push("/admin/bin/manager");
        }
        if (result?.error) {
          toast({
            title: "Error in updating Bin Manager",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
      }
    });
  };
  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Update bin manager</FormHeader>
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
                    type="text"
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
            disabled={isPending}
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
            name="location"
            disabled={isPending}
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default EditBinForm;
