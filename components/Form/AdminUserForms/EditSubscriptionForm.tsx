"use client";
import React, { useTransition } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubscriptionSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { updateSubscription } from "@/app/action/subscription";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
interface SubscriptionFormProps {
  id: string | undefined;
  isSubscribed: boolean | undefined;
}
const EditSubscriptionForm = ({ id, isSubscribed }: SubscriptionFormProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof SubscriptionSchema>>({
    resolver: zodResolver(SubscriptionSchema),
    defaultValues: {
      isSubscribed: isSubscribed,
    },
  });
  const onSubmit = (values: z.infer<typeof SubscriptionSchema>) => {
    startTransition(async () => {
      const data = await updateSubscription(values, id);
      if (!data?.error && data?.success !== undefined) {
        toast({
          title: "Success!",
          description: `${data.success}`,
        });
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <h2 className="mb-4 text-slate-800">Email Notifications</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isSubscribed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-300 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Bin Alerts</FormLabel>
                    <FormDescription>
                      Receive emails when the bin is full
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button
          disabled={isPending}
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-gray-50"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
          {isPending ? "Loading..." : "Save preferences"}
        </Button>
      </form>
    </Form>
  );
};

export default EditSubscriptionForm;
