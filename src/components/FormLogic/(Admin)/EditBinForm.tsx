"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { editBinSchema, EditBinFormValue } from "@/components/FormLogic/(Admin)/admin-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateBin } from "@/components/FormLogic/(Admin)/binCRUD"

interface EditBinFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  id: string
  email: string
  name: string
  faculty: "ENG" | "BUS" | "ASC" | "DES" | "HSS" | "IIT" | "OTHERS" | "EXT"
  location: string
  latLng: { lat: number; lng: number }
  initialLatLng: { lat: number; lng: number }
  onMobileMapShown: () => void
}

export function EditBinForm({
  id,
  name,
  email,
  faculty,
  location,
  latLng,
  initialLatLng,
  onMobileMapShown,
  className,
  ...props
}: EditBinFormProps){
  
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  const form = useForm<EditBinFormValue>({
    resolver: zodResolver(editBinSchema), 
    defaultValues: {
      // 👈 CRITICAL: Populate the existing data!
      name: name,
      email: email,
      faculty: faculty,
      location: location,
      lat: initialLatLng.lat,
      long: initialLatLng.lng,
      password: "", // Leave blank by default
      confirmPassword: ""
  }})

  useEffect(() => {
    if (latLng) {
      form.setValue("lat", latLng.lat, { shouldValidate: true })
      form.setValue("long", latLng.lng, { shouldValidate: true })
    }
  }, [latLng, form])

  async function onSubmit(editBinData: EditBinFormValue){
    setIsPending(true)
    setServerError(null)

    // 👇 1. Tell TypeScript this is a Partial object, making all keys optional
    const payload: Partial<EditBinFormValue> = { ...editBinData }
    
    // 👇 2. Now you can safely delete the passwords without TS complaining!
    if (!payload.password || payload.password === "") {
        delete payload.password
        delete payload.confirmPassword
    }

    try {
      // (Since your server action updateBin expects a Partial<EditBinFormValue>, 
      // this matches perfectly!)
      const result = await updateBin(payload, id)

      router.push("/admin/bin")
    } catch (error) {
      setServerError("Failed to update bin")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Edit Bin Manager</h1>
        </div>

        {serverError && (
          <div className="text-sm text-red-500 text-center font-medium">
            {serverError}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" type="text" disabled={isPending} className="bg-background" {...form.register("name")} />
          {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" disabled={isPending} className="bg-background" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
        </Field>

        {/* Password fields - Optional */}
        <Field>
          <FieldLabel htmlFor="password">New Password (Leave blank to keep existing)</FieldLabel>
          <Input id="password" type="password" disabled={isPending} className="bg-background" {...form.register("password")} />
          {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
        </Field>

        {/* ... (Add back your faculty, location, and lat/long fields here) ... */}

        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Updating..." : "Update Bin Manager"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}