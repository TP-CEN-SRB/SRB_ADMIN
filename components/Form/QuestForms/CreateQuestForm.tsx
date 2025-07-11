"use client";

import Card from "@/components/Card/Card";
import React, { useState, useTransition } from "react";
import FormHeader from "../FormHeader";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { QuestSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "../CustomFormMessage";
import { createQuest } from "@/app/action/quest";

const materialOptions = [
  { label: "Plastic", value: "PLASTIC" },
  { label: "Metal", value: "METAL" },
  { label: "Paper", value: "PAPER" },
  { label: "E-Waste", value: "E_WASTE" },
  { label: "General", value: "GENERAL" },
];

const CreateQuestForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof QuestSchema>>({
    resolver: zodResolver(QuestSchema),
    defaultValues: {
      title: "",
      description: "",
      target: 1,
      materialType: undefined,
      rewardPoints: 10,
      duration: 7,
    },
  });

  const onSubmit = (values: z.infer<typeof QuestSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    });

    startTransition(async () => {
      setError("");
      setSuccess("");
      const result = await createQuest(values);
      if (result?.success) {
        setSuccess("Quest created successfully at " + datetime);
        form.reset();
      } else if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Add a quest</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    placeholder="Recycle challenge"
                    {...field}
                  />
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
                    placeholder="Describe the objective of the quest..."
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
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Target</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} disabled={isPending} {...field} />
                  </FormControl>
                  <FormDescription>How many items to complete</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rewardPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Reward Points</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="materialType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Material Type</FormLabel>
                <FormControl>
                  <select
                    disabled={isPending}
                    {...field}
                    className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm"
                  >
                    <option value="">Select a material...</option>
                    {materialOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Duration (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    disabled={isPending}
                    placeholder="e.g. 7"
                    {...field}
                  />
                </FormControl>
                <FormDescription>This determines how long the quest lasts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

export default CreateQuestForm;
