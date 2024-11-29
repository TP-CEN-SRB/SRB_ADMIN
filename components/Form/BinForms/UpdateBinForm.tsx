"use client";

import { redirect, useRouter } from "next/navigation"; // Import useRouter
import { UpdateBinSchema } from "@/schemas";
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
import BinStatusCombobox from "./UpdateBinStatusCombobox";
import BinMaterialCombobox from "@/components/Form/BinMaterialForms/BinMaterialCombobox";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Bin, BinMaterial } from "@prisma/client";
import { updateBin } from "@/app/action/bin";
import Card from "@/components/Card/Card";
import FormHeader from "../FormHeader";

interface UpdateBinFormProps {
  id: string;
  initialData: Bin;
  materials: BinMaterial[];
  location: string;
  binMaterialName: string;
}

const UpdateBinForm = ({
  id,
  initialData,
  materials,
  location,
  binMaterialName,
}: UpdateBinFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Initialize useRouter
  const router = useRouter();

  const form = useForm<z.infer<typeof UpdateBinSchema>>({
    resolver: zodResolver(UpdateBinSchema),
    defaultValues: {
      location,
      status: initialData.status,
      materialId: initialData.binMaterialId,
    },
  });

  const onSubmit = (values: z.infer<typeof UpdateBinSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });
    startTransition(async () => {
      setError("");
      try {
        const result = await updateBin(id, values);
        if (result?.success) {
          setSuccess(result.success);
          toast({
            title: "Success",
            description: `Bin updated at ${datetime}`,
            variant: "default",
          });
          router.push("/admin/bin");
        } else if (result?.error) {
          setError(result.error || "An error occurred");
          toast({
            title: "Error",
            description: result.error || "Failed to update bin",
            duration: 2000,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Update error:", error);
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
    <Card rounded fullWidth>
      <FormHeader>Update Bin</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700d">
                  Location
                </FormLabel>
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
                <FormLabel className="font-bold text-slate-700">
                  Status
                </FormLabel>
                <FormControl>
                  <BinStatusCombobox field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="materialId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Material
                </FormLabel>
                <FormControl>
                  <BinMaterialCombobox
                    materials={materials}
                    field={field}
                    currentFieldName={binMaterialName}
                  />
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

export default UpdateBinForm;
