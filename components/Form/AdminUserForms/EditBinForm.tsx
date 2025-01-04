"use client";

import Card from "@/components/Card/Card";
import React, { useTransition } from "react";
import FormHeader from "../FormHeader";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { UpdateBinSchema } from "@/schemas/auth";
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
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const form = useForm<z.infer<typeof UpdateBinSchema>>({
    resolver: zodResolver(UpdateBinSchema),
    defaultValues: {
      name,
      email,
      faculty,
      location,
      isExistingPassword: true,
    },
  });
  const onSubmit = (values: z.infer<typeof UpdateBinSchema>) => {
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
  const isExistingPassword = useWatch({
    control: form.control,
    name: "isExistingPassword",
  });
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending || isExistingPassword}
                    placeholder="At least 8 characters"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.watch("isExistingPassword")}
                    onCheckedChange={(value) =>
                      form.setValue("isExistingPassword", value as boolean)
                    }
                    id="existingPassword"
                  />
                  <label htmlFor="existingPassword" className="text-sm">
                    Use existing password
                  </label>
                </div>
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
          <FormField
            control={form.control}
            name="mqttUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Mqtt URL
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="wss://broker.hivemq.com:8884/mqtt"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
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

export default EditBinForm;
