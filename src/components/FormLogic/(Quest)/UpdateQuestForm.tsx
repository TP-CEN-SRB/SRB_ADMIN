"use client"

import { useRouter } from "next/navigation"
import { UpdateQuestSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateQuest } from "@/app/action/quest"
import Card from "@/components/Card/Card"
import FormHeader from "@/components/FormLogic/FormHeader"

interface UpdateQuestFormProps {
  id: string
  quest: {
    title: string
    description: string
    target: number
    materialType: string
    rewardPoints: number
  }
}

const UpdateQuestForm = ({ id, quest }: UpdateQuestFormProps) => {
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const materialOptions = [
    { label: "Plastic", value: "PLASTIC" },
    { label: "Metal", value: "METAL" },
    { label: "Paper", value: "PAPER" },
    { label: "E-Waste", value: "E_WASTE" },
    { label: "General", value: "GENERAL" },
  ]

  const form = useForm<z.input<typeof UpdateQuestSchema>, unknown, z.output<typeof UpdateQuestSchema>>({
    resolver: zodResolver(UpdateQuestSchema),
    defaultValues: {
      title: quest.title,
      description: quest.description,
      target: quest.target,
      materialType: quest.materialType as
        | "PLASTIC"
        | "METAL"
        | "PAPER"
        | "E_WASTE"
        | "GENERAL",
      rewardPoints: quest.rewardPoints,
    },
  })

  const onSubmit = (values: z.output<typeof UpdateQuestSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    })

    startTransition(async () => {
      try {
        const result = await updateQuest(id, values)
        if (result?.success) {
          toast.success("Success",{
            description: `Quest updated at ${datetime}`,
          })
          router.push("/admin/activity/quest")
        } else {
          toast.error("Error",{
            description: result?.error || "Failed to update quest",
          })
        }
      } catch (error) {
        console.error("Update error:", error)
        toast.error("Error",{
          description: "An unexpected error occurred",
        })
      }
    })
  }

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Update Quest</FormHeader>
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
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="rewardPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Reward Points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    disabled={isPending}
                    {...field}
                    value={(field.value ?? "") as number | string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
  )
}

export default UpdateQuestForm
