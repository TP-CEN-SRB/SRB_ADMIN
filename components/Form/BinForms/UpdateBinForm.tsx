"use client";

import { BinSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "@/components/ui/input";
import BinStatusCombobox from "../BinStatusCombobox";
import BinMaterialCombobox from "../BinMaterialCombobox";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Bin } from "@prisma/client";
import { updateBin } from "@/app/action/bin";

interface UpdateBinFormProps {
  id: string;
  initialData: Bin;
}

const UpdateBinForm: React.FC<UpdateBinFormProps> = ({ id, initialData }) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof BinSchema>>({
    resolver: zodResolver(BinSchema),
    defaultValues: {
      location: initialData.location,
      status: initialData.status,
      material: initialData.material,
      userId: initialData.userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof BinSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });

    startTransition(async () => {
      try {
        setError("");
        setSuccess(""); // Reset success state
        const result = await updateBin(id, values);
        if (result?.success) {
          setSuccess(result.success);
          toast({
            title: "Success",
            description: `Bin updated at ${datetime}`,
            variant: "default",
          });
        } else {
          setError(result?.error || "An error occurred");
          toast({
            title: "Error",
            description: result?.error || "Failed to update bin",
            duration: 2000,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Update error:", error); // Debug log
        setError("An unexpected error occurred");
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          duration: 2000,
          variant: "destructive",
        });
      }
    });
  };
  return (
    <div className=" min-h-screen flex flex-col items-center justify-center container mx-auto max-w-screen-xs">
      <div className="w-full">
        <h1 className="mb-4 flex">Update Bin</h1>
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

            <Button disabled={isPending} className="w-full" type="submit">
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

export default UpdateBinForm;
