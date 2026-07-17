"use client"

import { useTransition } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { updateEvent } from "@/app/action/event"
import { UpdateEventSchema } from "@/schemas"

type Props = {
  initialData: z.infer<typeof UpdateEventSchema>
}

const UpdateEventForm = ({ initialData }: Props) => {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof UpdateEventSchema>>({
    resolver: zodResolver(UpdateEventSchema),
    defaultValues: {
      ...initialData,
      startDate: new Date(initialData.startDate ?? new Date()),
      endDate: new Date(initialData.endDate ?? new Date()),
    },
  })

  const onSubmit = (values: z.infer<typeof UpdateEventSchema>) => {
    startTransition(async () => {
      try {
        const result = await updateEvent(values.id, values)
        if (result?.success) {
          const time = new Date().toLocaleString("en-SG", {
            timeZone: "Asia/Singapore",
            hour12: false,
          })
          toast.success("Event updated", {
            description: `Updated at ${time}`,
          })
        } else {
          form.setError("root", { message: result?.error || "Unknown error" })
        }
      } catch (err) {
        form.setError("root", { message: "An unexpected error occurred." })
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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
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
                <FormLabel>End Date</FormLabel>
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

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

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

export default UpdateEventForm
