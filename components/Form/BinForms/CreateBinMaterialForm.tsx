"use client";

import { useRouter } from "next/navigation"; // Import useRouter
import { BinMaterialSchema, UpdateBinSchema } from "@/schemas";
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
import BinMaterialCombobox from "../BinMaterialComboBox";
import { Button } from "../../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Bin, BinMaterial } from "@prisma/client";
import { createBinMaterial, updateBin } from "@/app/action/bin";
import Card from "@/components/Card/Card";
import FormHeader from "../FormHeader";

interface UpdateBinFormProps {
  id: string;
  initialData: Bin;
  materials: BinMaterial[];
}

const CreateBinMaterialForm: React.FC<UpdateBinFormProps> = ({
  id,
  initialData,
  materials,
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter(); // Initialize useRouter

  const form = useForm<z.infer<typeof BinMaterialSchema>>({
    resolver: zodResolver(BinMaterialSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof BinMaterialSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });

    startTransition(async () => {
      setError("");
      try {
        const result = await createBinMaterial(values);
        if (result?.success) {
          setSuccess(result.success);
          toast({
            title: "Success",
            description: `Bin updated at ${datetime}`,
            variant: "default",
          });
          router.push("/admin/bin"); // Use router.push for client-side navigation
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
      <FormHeader>Create Material</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700d">
                  Name
                </FormLabel>
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
          <Button disabled={isPending} className="w-full" type="submit">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CreateBinMaterialForm;
