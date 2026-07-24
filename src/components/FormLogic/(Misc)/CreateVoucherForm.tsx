"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle } from "lucide-react"

import { VoucherSchema } from "@/schemas"
import { createVoucher } from "@/app/action/voucher"
import { getStoreOptions } from "@/app/action/store"

type VoucherFormValue = z.output<typeof VoucherSchema>
type StoreOption = { id: string; name: string; faculty: string }

export function CreateVoucherForm() {
  const [isPending, startTransition] = useTransition()
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([])

  useEffect(function () {
    getStoreOptions().then(setStoreOptions)
  }, [])

  const form = useForm<z.input<typeof VoucherSchema>, unknown, z.output<typeof VoucherSchema>>({
    resolver: zodResolver(VoucherSchema),
    defaultValues: {
      name: "",
      description: "",
      isAvailable: true,
      pointsRequired: undefined,
      storeIds: [],
    },
  })

  const onSubmit = (values: VoucherFormValue) => {
    startTransition(async function () {
      const result = await createVoucher(values)

      if (result?.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof VoucherFormValue, {
            type: "manual",
            message: messages?.[0] || "Invalid input",
          })
        }
      } else if (result?.error) {
        form.setError("root", { message: result.error })
      }

      if (result?.success) {
        toast.success("Voucher created", { description: result.success })
        form.reset({ name: "", description: "", isAvailable: true, pointsRequired: undefined, storeIds: [] })
        const fileInput = document.querySelector<HTMLInputElement>('input[name="image"]')
        if (fileInput) fileInput.value = ""
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
                <Input disabled={isPending} placeholder="Free Iced Coffee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pointsRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points Required</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  type="number"
                  placeholder="100"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending}
                  placeholder="Redeemable at any registered store"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  {...field}
                  onChange={(e) => onChange(e.target.files?.[0])}
                />
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
                    value={field.value ? (field.value as Date).toISOString().split("T")[0] : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
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
                    value={field.value ? (field.value as Date).toISOString().split("T")[0] : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>Leave dates blank for a voucher with no time limit.</FormDescription>

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <FormLabel>Available</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storeIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowed Stores</FormLabel>
              <FormDescription>
                Leave all unchecked to allow any registered store to fulfill this voucher.
              </FormDescription>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                {storeOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No stores registered yet.</p>
                ) : (
                  storeOptions.map((store) => {
                    const checked = (field.value ?? []).includes(store.id)
                    return (
                      <div key={store.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`store-${store.id}`}
                          disabled={isPending}
                          checked={checked}
                          onCheckedChange={(isChecked) => {
                            const current: string[] = field.value ?? []
                            field.onChange(
                              isChecked
                                ? [...current, store.id]
                                : current.filter((id) => id !== store.id)
                            )
                          }}
                        />
                        <label htmlFor={`store-${store.id}`} className="text-sm">
                          {store.name} <span className="text-muted-foreground">({store.faculty})</span>
                        </label>
                      </div>
                    )
                  })
                )}
              </div>
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
          {isPending ? "Creating..." : "Create Voucher"}
        </Button>
      </form>
    </Form>
  )
}
