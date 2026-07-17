"use client"

import { useRouter } from "next/navigation"
import { UpdateQuestSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
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
import { updateQuest } from "@/app/action/quest"

const materialOptions = [
  { label: "Plastic", value: "PLASTIC" },
  { label: "Metal", value: "METAL" },
  { label: "Paper", value: "PAPER" },
  { label: "E-Waste", value: "E_WASTE" },
  { label: "General", value: "GENERAL" },
]

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
          toast.success("Success", {
            description: `Quest updated at ${datetime}`,
          })
          router.push("/admin/activity/quest")
        } else {
          toast.error("Error", {
            description: result?.error || "Failed to update quest",
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "An unexpected error occurred",
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                    {...field}
                    value={(field.value ?? "") as number | string}
                  />
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
              <FormLabel>Material Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materialOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}

export default UpdateQuestForm
