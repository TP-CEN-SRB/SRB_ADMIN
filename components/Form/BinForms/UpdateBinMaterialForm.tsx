"use client";

import { useRouter } from "next/navigation";
import { BinMaterialSchema, UpdateBinSchema } from "@/schemas";
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
import { Input } from "@/components/ui/input";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Card from "@/components/Card/Card";
import FormHeader from "../FormHeader";
import { updateBinMaterial } from "@/app/action/binMaterial";
import { BinMaterial } from "@prisma/client";

interface UpdateBinFormProps {
  id: string;
  binMaterial: BinMaterial;
}

const UpdateBinMaterialForm = ({ id, binMaterial }: UpdateBinFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  const form = useForm<z.infer<typeof BinMaterialSchema>>({
    resolver: zodResolver(BinMaterialSchema),
    defaultValues: {
      name: binMaterial.name,
      multiplier: binMaterial.multiplier,
    },
  });

  const onSubmit = (values: z.infer<typeof BinMaterialSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });

    startTransition(async () => {
      try {
        const result = await updateBinMaterial(id, values);
        if (result?.success) {
          toast({
            title: "Success",
            description: `Bin Material updated at ${datetime}`,
            variant: "default",
          });
          router.push("/admin/bin/material");
        } else if (result?.error) {
          toast({
            title: "Error",
            description: result.error || "Failed to update material",
            duration: 2000,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Update error:", error);
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
    <Card isAdmin rounded fullWidth>
      <FormHeader>Update material</FormHeader>
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
                    placeholder="PLASTIC"
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
            name="multiplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Multiplier
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="1.0"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormDescription>
                  Sets the points earned per gram of material recycled
                </FormDescription>
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

export default UpdateBinMaterialForm;
