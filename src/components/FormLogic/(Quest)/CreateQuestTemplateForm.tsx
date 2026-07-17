"use client"

import { useState, useTransition } from "react"
import { QuestTemplateSchema } from "@/schemas"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import Card from "@/components/Card/Card"
import FormHeader from "../FormHeader"

import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

import { createQuestTemplate } from "@/app/action/questTemplate"
import CustomFormMessage from "../CustomFormMessage"

const materialOptions = [
  { label: "Plastic", value: "PLASTIC" },
  { label: "Metal", value: "METAL" },
  { label: "Paper", value: "PAPER" },
  { label: "E-Waste", value: "E_WASTE" },
  { label: "General", value: "GENERAL" },
]

export default function CreateQuestTemplateForm() {
  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const form = useForm<z.input<typeof QuestTemplateSchema>, unknown, z.output<typeof QuestTemplateSchema>>({
    resolver: zodResolver(QuestTemplateSchema),
    defaultValues: {
      title: "",
      description: "",
      target: 1,
      rewardPoints: 10,
      materialType: "PLASTIC",
      duration: 7,
    },
  })

  const onSubmit = (values: z.output<typeof QuestTemplateSchema>) => {
    startTransition(async () => {
      setError("")
      setSuccess("")

      const result = await createQuestTemplate(values)

      if (result?.success) {
        setSuccess("Quest Template created successfully!")
        form.reset()
      } else {
        setError(result?.error || "An unexpected error occurred.")
      }
    })
  }

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Create Quest Template</FormHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Title</FormLabel>
                <FormControl>
                  <Input disabled={isPending} placeholder="Weekly Recycling Challenge" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Description</FormLabel>
                <FormControl>
                  <Textarea disabled={isPending} placeholder="Describe this template..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target + Reward row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Target */}
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Target</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      disabled={isPending}
                      {...field}
                      value={(field.value ?? "") as number | string}
                    />
                  </FormControl>
                  <FormDescription>Required amount of grams</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reward Points */}
            <FormField
              control={form.control}
              name="rewardPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700">Reward Points</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={isPending}
                      value={(field.value ?? "") as number | string}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Material */}
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
                    {materialOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
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
                    value={(field.value ?? "") as number | string}
                  />
                </FormControl>
                <FormDescription>How long the quest lasts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error / Success */}
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && <CustomFormMessage type="Success">{success}</CustomFormMessage>}

          {/* Submit */}
          <Button
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            type="submit"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Creating..." : "Create Template"}
          </Button>
        </form>
      </Form>
    </Card>
  )
}
