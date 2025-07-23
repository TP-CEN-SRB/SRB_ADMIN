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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "../CustomFormMessage";
import { createEvent } from "@/app/action/event";
import { EventSchema } from "@/schemas";

const CreateEventForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof EventSchema>>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof EventSchema>) => {
    startTransition(async () => {
      try {
        setError("");
        setSuccess("");
        const result = await createEvent(values);
        if (result?.success) {
          const timestamp = new Date().toLocaleString("en-SG", {
            timeZone: "Asia/Singapore",
            hour12: false,
          });
          setSuccess("Event created successfully at " + timestamp);
          form.reset();
        } else {
          setError(result?.error || "Unknown error");
        }
      } catch (err) {
        console.error("createEvent error:", err);
        setError("An unexpected error occurred.");
      }
    });
  };

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Add an event</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Title</FormLabel>
                <FormControl>
                  <Input disabled={isPending} placeholder="Clean-up Campaign" {...field} />
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
                  <Textarea
                    disabled={isPending}
                    placeholder="Describe the event in detail..."
                    {...field}
                  />
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
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CreateEventForm;
