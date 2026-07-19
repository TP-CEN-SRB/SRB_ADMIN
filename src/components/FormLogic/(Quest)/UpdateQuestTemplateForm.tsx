"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { QuestTemplateSchema } from "@/schemas"
import { updateQuestTemplate } from "@/app/action/questTemplate"

import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

const materialOptions = [
  { label: "Plastic", value: "PLASTIC" },
  { label: "Metal", value: "METAL" },
  { label: "Paper", value: "PAPER" },
  { label: "E-Waste", value: "E_WASTE" },
  { label: "General", value: "GENERAL" },
]

interface Props {
  id: string
  template: {
    title: string
    description: string
    target: number
    rewardPoints: number
    materialType: string
    duration: number
  }
}

export default function UpdateQuestTemplateForm({ id, template }: Props) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.input<typeof QuestTemplateSchema>, unknown, z.output<typeof QuestTemplateSchema>>({
    resolver: zodResolver(QuestTemplateSchema),
    defaultValues: {
      title: template.title,
      description: template.description,
      target: template.target,
      rewardPoints: template.rewardPoints,
      materialType: template.materialType as
        | "PLASTIC"
        | "METAL"
        | "PAPER"
        | "E_WASTE"
        | "GENERAL",
      duration: template.duration,
    },
  })

  const onSubmit = (values: z.output<typeof QuestTemplateSchema>) => {
    startTransition(async function(){
      const res = await updateQuestTemplate(id, values)

      if (res?.success) {
        toast.success("Quest Template updated")
        form.reset(values)
      } else {
        form.setError("root", { message: res?.error || "Failed to update quest template." })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input disabled={isPending} placeholder="Template title" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending}
                  placeholder="Describe this quest template..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row: Target + Reward */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target</FormLabel>
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

          <FormField
            control={form.control}
            name="rewardPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Points</FormLabel>
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
              <FormLabel>Material Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materialOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel>Duration (days)</FormLabel>
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
              <FormDescription>How long this quest lasts</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        {/* Submit */}
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isPending ? "Updating..." : "Update Template"}
        </Button>
      </form>
    </Form>
  )
}
