"use client";

import { useRouter } from "next/navigation";
import { UpdateStoreSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateStore } from "@/app/action/store";
import Card from "@/components/Card/Card";
import FormHeader from "@/components/Form/FormHeader";

// Faculty options
const FacultyEnum = ["ENG", "BUS", "ASC", "IIT", "HSS", "DES", "OTHERS", "EXT"] as const;

interface UpdateStoreFormProps {
  id: string;
  store: {
    name: string;
    email: string;
    faculty: string;
  };
}

const UpdateStoreForm = ({ id, store }: UpdateStoreFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof UpdateStoreSchema>>({
    resolver: zodResolver(UpdateStoreSchema),
    defaultValues: {
      name: store.name,
      email: store.email,
      faculty: store.faculty,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof UpdateStoreSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });

    startTransition(async () => {
      try {
        const result = await updateStore(id, values);

        if (result?.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof typeof values, {
              type: "manual",
              message: messages?.[0] || "Invalid input",
            });
          }
        }

        if (result?.success) {
          toast({
            title: "Success",
            description: `Store updated at ${datetime}`,
            variant: "default",
          });
          router.push("/admin/store");
        } else if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Unexpected error occurred",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Update Store</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
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
                  <Input type="email" disabled={isPending} {...field} />
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
                <FormLabel>New Password</FormLabel>
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
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
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

          <Button
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            type="submit"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Updating..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default UpdateStoreForm;
