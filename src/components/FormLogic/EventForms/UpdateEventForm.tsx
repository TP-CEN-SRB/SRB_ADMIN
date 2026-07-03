"use client";

import Card from "@/components/Card/Card";
import React, { useState, useTransition } from "react";
import FormHeader from "../FormHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "../CustomFormMessage";
import { updateEvent } from "@/app/action/event";
import { UpdateEventSchema } from "@/schemas";

type Props = {
  initialData: z.infer<typeof UpdateEventSchema>;
};

const UpdateEventForm = ({ initialData }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const form = useForm<z.infer<typeof UpdateEventSchema>>({
    resolver: zodResolver(UpdateEventSchema),
    defaultValues: {
      ...initialData,
      startDate: new Date(initialData.startDate ?? new Date()),
      endDate: new Date(initialData.endDate ?? new Date()),
    },
  });

  const onSubmit = (values: z.infer<typeof UpdateEventSchema>) => {
    startTransition(async () => {
      try {
        setError("");
        setSuccess("");
        const result = await updateEvent(values.id, values);
        if (result?.success) {
          const time = new Date().toLocaleString("en-SG", {
            timeZone: "Asia/Singapore",
            hour12: false,
          });
          setSuccess("Event updated at " + time);
        } else {
          setError(result?.error || "Unknown error");
        }
      } catch (err) {
        console.error("updateEvent error:", err);
        setError("An unexpected error occurred.");
      }
    });
  };

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Edit event</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Title</FormLabel>
                <FormControl>
                  <Input disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Description</FormLabel>
                <FormControl>
                  <Textarea disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isPending}
                      value={field.value?.toISOString().split("T")[0]}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isPending}
                      value={field.value?.toISOString().split("T")[0]}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && <CustomFormMessage type="Success">{success}</CustomFormMessage>}

          <Button
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            type="submit"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default UpdateEventForm;
