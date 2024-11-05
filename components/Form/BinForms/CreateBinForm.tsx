"use client";

import { BinSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import BinStatusCombobox from "../BinStatusCombobox";
import BinMaterialCombobox from "../BinMaterialCombobox";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BinMaterial, BinStatus, User } from "@prisma/client";
import { createBin } from "@/app/action/bin";
import { redirect } from "next/navigation";

interface CreateBinFormProps {
  users: User[]; // Explicitly defining the type for users prop
}

const CreateBinForm: React.FC<CreateBinFormProps> = ({ users }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof BinSchema>>({
    resolver: zodResolver(BinSchema),
    defaultValues: {
      location: "",
      status: BinStatus.FUNCTIONAL,
      material: BinMaterial.PLASTIC,
    },
  });

  const onSubmit = (values: z.infer<typeof BinSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false, // 24-hour format, remove if 12-hour format is needed
    });
    startTransition(async () => {
      setError("");
      const result = await createBin(values);
      console.log(result?.error);

      if (result?.success) {
        setSuccess(result?.success as string);
        toast({
          title: "Bin created successfully",
          description: `Bin created at ${datetime}`,
          duration: 2000,
          variant: "default",
        });
        redirect("/admin/bin/all");
      } else if (result?.error) {
        setError(result?.error);
        toast({
          title: "Error creating bin",
          description: result?.error,
          duration: 2000,
          variant: "destructive",
        });
      }
    });
  };
  return (
    <div className=" min-h-screen flex flex-col items-center justify-center container mx-auto max-w-screen-xs">
      <div className="w-full">
        <h1>Add new bin</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Location</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Near Library"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Status</FormLabel>
                  <FormControl>
                    <BinStatusCombobox field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Material</FormLabel>
                  <FormControl>
                    <BinMaterialCombobox field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Managed by</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This bin will be managed by the selected user.
                  </FormDescription>
                </FormItem>
              )}
            />

            <Button
              disabled={isPending}
              className="w-full"
              type="submit"
              onClick={() => {
                //console.log({ error }, { success });
              }}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                ""
              )}
              {isPending ? "Loading..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateBinForm;
