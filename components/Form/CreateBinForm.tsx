"use client";

import { createBin, BinFormState } from "@/app/action/bin";
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
} from "../ui/form";
import { Input } from "@/components/ui/input";
import BinStatusCombobox from "./BinStatusCombobox";
import BinMaterialCombobox from "./BinMaterialCombobox";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BinMaterial, BinStatus } from "@prisma/client";

const CreateBinForm = () => {
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
      //const result = await createBin(values);
      const result = await fetch("/api/bin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: values.location,
          status: values.status,
          material: values.material,
        }),
      });
      const data = await result.json();
      if (data.success) {
        setSuccess(data.success as string);
        toast({
          title: "Bin created successfully",
          description: `Bin created at ${datetime}`,
          duration: 2000,
        });
      } else if (data.error) {
        setError(data.error);
        toast({
          title: "Error creating bin",
          description: data.error,
          duration: 2000,
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
            <Button
              disabled={isPending}
              className="w-full"
              type="submit"
              onClick={() => {
                console.log({ error }, { success });
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
