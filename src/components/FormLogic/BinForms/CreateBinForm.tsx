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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BinStatusCombobox from "@/components/FormLogic/BinForms/CreateBinStatusCombobox";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BinMaterial, BinStatus } from "@/generated/prisma";
import { createBin } from "@/app/action/bin";
import { redirect } from "next/navigation";
import BinMaterialCheckBox from "@/components/FormLogic/BinMaterialForms/BinMaterialCheckbox";
import Card from "@/components/Card/Card";
import FormHeader from "../FormHeader";

interface CreateBinFormProps {
  materials: BinMaterial[];
  binUserId: string;
  binLocation: string | undefined | null;
  usedBinMaterials: { id: string; name: string }[];
}

const CreateBinForm = ({
  materials,
  binUserId,
  binLocation,
  usedBinMaterials,
}: CreateBinFormProps) => {
  const [isPending, startTransition] = useTransition();
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
      const result = await createBin(values, binUserId);
      if (result?.success) {
        toast("Bin created successfully",{
          description: `Bin created at ${datetime}`,
          duration: 2000,
        });
        // Reset the form, including clearing materialIds
        form.reset({
          location: "",
          status: BinStatus.FUNCTIONAL,
          materialIds: [],
        });
        redirect("/admin/bin");
      } else if (result?.error) {
        toast.error("Error creating bin",{
          description: result?.error,
          duration: 2000,

        });
      }
    });
  };

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Add a bin</FormHeader>
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
                    disabled={true}
                    placeholder="Near Library"
                    {...field}
                    type="text"
                    className="bg-gray-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
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
          /> */}
          {/* change to drop down list to select material */}
          <FormField
            control={form.control}
            name="materialIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Material(s)</FormLabel>
                <FormControl>
                  <BinMaterialCheckBox
                    materials={materials}
                    field={field}
                    usedBinMaterials={usedBinMaterials}
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

export default CreateBinForm;
