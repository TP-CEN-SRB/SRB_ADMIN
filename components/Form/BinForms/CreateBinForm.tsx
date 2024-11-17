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
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BinMaterial, BinStatus, User } from "@prisma/client";
import { createBin } from "@/app/action/bin";
import { redirect } from "next/navigation";
import BinMaterialCheckBox from "@/components/Form/BinMaterialCheckbox";
import Card from "@/components/Card/Card";
import FormHeader from "../FormHeader";

interface CreateBinFormProps {
  materials: BinMaterial[];
  binUserId: string;
  binLocation: string | undefined | null;
}

const CreateBinForm: React.FC<CreateBinFormProps> = ({
  materials,
  binUserId,
  binLocation,
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof BinSchema>>({
    resolver: zodResolver(BinSchema),
    defaultValues: {
      location: binLocation || "",
      status: BinStatus.FUNCTIONAL,
      materialIds: [],
    },
  });

  const onSubmit = (values: z.infer<typeof BinSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false, // 24-hour format, remove if 12-hour format is needed
    });
    startTransition(async () => {
      setError(""); //reset error message
      const result = await createBin(values, binUserId);

      if (result?.success) {
        setSuccess(result?.success as string);
        toast({
          title: "Bin created successfully",
          description: `Bin created at ${datetime}`,
          duration: 2000,
          variant: "default",
        });
        // Reset the form, including clearing materialIds
        form.reset({
          location: "",
          status: BinStatus.FUNCTIONAL,
          materialIds: [],
        });
        redirect("/admin/bin");
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
    <Card rounded fullWidth>
      <FormHeader>Create a bin</FormHeader>
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
          {/* change to drop down list to select material */}
          <FormField
            control={form.control}
            name="materialIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Material(s)</FormLabel>
                <FormControl>
                  <BinMaterialCheckBox materials={materials} field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CreateBinForm;
