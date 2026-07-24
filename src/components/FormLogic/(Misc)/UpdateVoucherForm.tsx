"use client"

import { useRouter } from "next/navigation"
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
import { Loader2, Save } from "lucide-react"

import { UpdateVoucherSchema } from "@/schemas"
import { updateVoucher } from "@/app/action/voucher"
import { getStoreOptions } from "@/app/action/store"

type UpdateVoucherFormValue = z.output<typeof UpdateVoucherSchema>
type StoreOption = { id: string; name: string; faculty: string }

interface UpdateVoucherFormProps {
  id: string
  voucher: {
    name: string
    pointsRequired: number
    description: string
    isAvailable: boolean
    image: string
    startDate: Date | null
    endDate: Date | null
    allowedStores: { id: string }[]
  }
}

export function UpdateVoucherForm({ id, voucher }: UpdateVoucherFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([])

  useEffect(function () {
    getStoreOptions().then(setStoreOptions)
  }, [])

  const form = useForm<z.input<typeof UpdateVoucherSchema>, unknown, z.output<typeof UpdateVoucherSchema>>({
    resolver: zodResolver(UpdateVoucherSchema),
    defaultValues: {
      name: voucher.name,
      pointsRequired: voucher.pointsRequired,
      description: voucher.description,
      isAvailable: voucher.isAvailable,
      startDate: voucher.startDate ?? undefined,
      endDate: voucher.endDate ?? undefined,
      storeIds: voucher.allowedStores.map((store) => store.id),
    },
  })

  const onSubmit = (values: UpdateVoucherFormValue) => {
    startTransition(async function () {
      const result = await updateVoucher(id, values)

      if (result?.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof UpdateVoucherFormValue, {
            type: "manual",
            message: messages?.[0] || "Invalid input",
          })
        }
      }

      if (result?.success) {
        toast.success("Success", { description: result.success })
        router.push("/admin/voucher")
      } else if (result?.error) {
        toast.error("Error", { description: result.error })
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
                <Input disabled={isPending} {...field} />
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
                <Textarea disabled={isPending} {...field} />
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
              <FormLabel>Replace Image</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  {...field}
                  onChange={(e) => onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>Leave empty to keep the current image.</FormDescription>
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
                                : current.filter((sid) => sid !== store.id)
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

        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
