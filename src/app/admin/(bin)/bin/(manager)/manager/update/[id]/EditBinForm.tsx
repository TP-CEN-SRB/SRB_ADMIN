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
      name: name,
      email: email,
      faculty: faculty,
      location: location,
      lat: initialLatLng.lat,
      long: initialLatLng.lng,
      password: "", 
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

    const payload: Partial<EditBinFormValue> = { ...editBinData }
    
    if (!payload.password || payload.password === "") {
        delete payload.password
        delete payload.confirmPassword
    }

    try {
      const result = await updateBin(payload, id)
      router.push("/admin/bin")
    } catch (error) {
      setServerError("Failed to update bin")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      // 👇 Applied the layout constraint classes here
      className={cn("flex flex-col gap-6 w-full max-w-md mx-auto p-6 py-12", className)} 
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center mb-4">
          <h1 className="text-2xl font-bold">Edit Bin Manager</h1>
        </div>

        {serverError && (
          // 👇 Swapped text-red-500 for text-destructive
          <div className="text-sm text-destructive text-center font-medium">
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

        <Field>
          <FieldLabel htmlFor="faculty">Faculty</FieldLabel>
          {/* 👇 Swapped generic Input for the styled Select to enforce type safety */}
          <select
            id="faculty"
            disabled={isPending}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
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
          {form.formState.errors.faculty && <p className="text-sm text-destructive">{form.formState.errors.faculty.message}</p>}
        </Field>
        
        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            type="text"
            className="bg-background"
            disabled={isPending}
            {...form.register("location")}
          />
          {form.formState.errors.location && (<p className="text-sm text-destructive">{form.formState.errors.location.message}</p>)}
        </Field>

        <Field className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="lat">Latitude</FieldLabel>
            {/* 👇 Changed type="text" to type="number" and added step="any" */}
            <Input id="lat" type="number" step="any" disabled={isPending} className="bg-background" {...form.register("lat", { valueAsNumber: true })} />
            {form.formState.errors.lat && <p className="text-sm text-destructive">{form.formState.errors.lat.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="long">Longitude</FieldLabel>
            {/* 👇 Changed type="text" to type="number" and added step="any" */}
            <Input id="long" type="number" step="any" disabled={isPending} className="bg-background" {...form.register("long", { valueAsNumber: true })} />
            {form.formState.errors.long && <p className="text-sm text-destructive">{form.formState.errors.long.message}</p>}
          </Field>
        </Field>

        <Field className="mt-2">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Updating..." : "Update Bin Manager"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}