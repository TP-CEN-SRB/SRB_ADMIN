"use client"

import { useTransition } from "react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { BinMaterialSchema } from "@/schemas"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle } from "lucide-react"
import { createBinMaterial } from "./action"

const CreateBinMaterialForm = function(){
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof BinMaterialSchema>>({
    resolver: zodResolver(BinMaterialSchema),
    defaultValues: {
      name: "",
      multiplier: undefined,
    },
  })

  const onSubmit = (values: z.infer<typeof BinMaterialSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    })
    startTransition(async function(){
      const result = await createBinMaterial(values)
      if (result?.success) {
        toast.success("Bin material created", {
          description: `Created at ${datetime}`,
        })
        form.reset({ name: "", multiplier: undefined })
      } else if (result?.error) {
        form.setError("root", { message: result.error })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isPending} placeholder="Plastic" {...field} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="multiplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Multiplier</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="1.0"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  type="number"
                />
              </FormControl>
              <FormDescription>
                Sets the points earned per gram of material recycled
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 size-4" />
          )}
          {isPending ? "Creating..." : "Create Material"}
        </Button>
      </form>
    </Form>
  )
}

export default CreateBinMaterialForm
