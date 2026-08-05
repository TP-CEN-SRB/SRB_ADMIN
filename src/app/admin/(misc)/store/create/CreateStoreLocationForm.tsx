"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { StoreSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { createStore } from "@/app/action/store"
import { z } from "zod"

type StoreFormValue = z.infer<typeof StoreSchema>

// Mirrors SignUpBinForm (bin manager create) - name/email/faculty/credentials
// plus a location label and lat/long kept in sync with the draggable pin on
// the map beside it.
interface CreateStoreLocationFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  latLng: { lat: number; lng: number }
  initialLatLng: { lat: number; lng: number }
  onMobileMapShown: () => void
  onLatLngChange: (latLng: { lat: number; lng: number }) => void
}

export function CreateStoreLocationForm({
  latLng,
  initialLatLng,
  onMobileMapShown,
  onLatLngChange,
  className,
  ...props
}: CreateStoreLocationFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<StoreFormValue>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      lat: latLng.lat,
      long: latLng.lng,
    },
  })

  useEffect(function(){
    if (latLng) {
      form.setValue("lat", latLng.lat, { shouldValidate: true })
      form.setValue("long", latLng.lng, { shouldValidate: true })
    }
  }, [latLng, form])

  async function onSubmit(data: StoreFormValue) {
    setIsPending(true)
    setServerError(null)

    const result = await createStore(data)

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        form.setError(field as keyof StoreFormValue, {
          type: "manual",
          message: messages?.[0] || "Invalid input",
        })
      }
    }

    if (result.error) {
      setServerError(result.error)
      setIsPending(false)
      return
    }

    setIsPending(false)
    router.push("/admin/store/map")
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6 w-full max-w-md mx-auto p-6 py-12", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center mb-4">
          <h1 className="text-2xl font-bold">Add Store</h1>
        </div>

        {serverError && (
          <div className="text-sm text-destructive text-center font-medium">
            {serverError}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Store Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Drink Store"
            className="bg-background"
            disabled={isPending}
            {...form.register("name")}
          />
          {form.formState.errors.name && (<p className="text-sm text-destructive">{form.formState.errors.name.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="store@example.com"
            className="bg-background"
            disabled={isPending}
            {...form.register("email")}
          />
          {form.formState.errors.email && (<p className="text-sm text-destructive">{form.formState.errors.email.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="faculty">Faculty</FieldLabel>
          <select
            id="faculty"
            defaultValue=""
            disabled={isPending}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...form.register("faculty")}
          >
            <option value="" disabled>Select Faculty</option>
            <option value="ENG">ENG</option>
            <option value="BUS">BUS</option>
            <option value="ASC">ASC</option>
            <option value="DES">DES</option>
            <option value="HSS">HSS</option>
            <option value="IIT">IIT</option>
            <option value="OTHERS">OTHERS</option>
            <option value="EXT">EXTERNAL</option>
          </select>
          {form.formState.errors.faculty && (<p className="text-sm text-destructive">{form.formState.errors.faculty.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            type="text"
            className="bg-background"
            placeholder="e.g. Block 17, Level 1, ENG"
            disabled={isPending}
            {...form.register("location")}
          />
          {form.formState.errors.location && (<p className="text-sm text-destructive">{form.formState.errors.location.message}</p>)}
        </Field>

        <Field className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="lat">Latitude</FieldLabel>
            <Input
              id="lat"
              type="number"
              step="any"
              className="bg-background"
              disabled={isPending}
              {...form.register("lat", { valueAsNumber: true })}
            />
            {form.formState.errors.lat && (<p className="text-sm text-destructive">{form.formState.errors.lat.message}</p>)}
          </Field>

          <Field>
            <FieldLabel htmlFor="long">Longitude</FieldLabel>
            <Input
              id="long"
              type="number"
              step="any"
              className="bg-background"
              disabled={isPending}
              {...form.register("long", { valueAsNumber: true })}
            />
            {form.formState.errors.long && (<p className="text-sm text-destructive">{form.formState.errors.long.message}</p>)}
          </Field>
        </Field>

        <p className="text-xs text-muted-foreground -mt-2">
          Drag the pin on the map to set exactly where members should collect their voucher.{" "}
          <button type="button" onClick={onMobileMapShown} className="underline md:hidden">
            Open map
          </button>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" type="password" disabled={isPending} className="bg-background" {...form.register("password")} />
            {form.formState.errors.password && (<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>)}
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input id="confirmPassword" type="password" disabled={isPending} className="bg-background" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && (<p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>)}
          </Field>
        </div>

        <Field className="mt-2">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create Store"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
