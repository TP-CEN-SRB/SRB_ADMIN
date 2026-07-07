"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { signupBinSchema, SignupBinFormValue } from "@/components/FormLogic/(Admin)/admin-schema"
import { zodResolver } from "@hookform/resolvers/zod"

interface SignUpBinFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  latLng: { lat: number; lng: number }
  initialLatLng: { lat: number; lng: number }
  onMobileMapShown: () => void
  onLatLngChange: (latLng: { lat: number; lng: number }) => void
}

export function SignUpBinForm({
  latLng,
  initialLatLng,
  onMobileMapShown,
  onLatLngChange,
  className,
  ...props
}: SignUpBinFormProps){

  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  const form = useForm<SignupBinFormValue>({resolver: zodResolver(signupBinSchema), defaultValues: {
      latitude: latLng.lat,
      longitude: latLng.lng,
  }})


  useEffect(() => {
    if (latLng) {
      form.setValue("latitude", latLng.lat, { shouldValidate: true })
      form.setValue("longitude", latLng.lng, { shouldValidate: true })
    }
  }, [latLng, form])
  
  async function onSubmit(signupBinData: SignupBinFormValue){
    setIsPending(true)
    setServerError(null)

    const { data, error } = await authClient.signUp.email({
      name: signupBinData.name,
      email: signupBinData.email,
      password: signupBinData.password,
      faculty: signupBinData.faculty,
      location: signupBinData.location,
      lat: signupBinData.latitude,
      long: signupBinData.longitude,
      role: "BIN"
    })

    if (error) {
      setServerError(error.message || "Failed to create bin account.")
      setIsPending(false)
      return
    }
    setIsPending(false)
    router.push("/admin/bin/manager/map")
  }

return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>

        {serverError && (
          <div className="text-sm text-red-500 text-center font-medium">
            {serverError}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="bg-background"
            {...form.register("name")}
          />
          {form.formState.errors.name && (<p className="text-sm text-destructive">{form.formState.errors.name.message}</p>)}
        </Field>


        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="bg-background"
            {...form.register("email")}
          />
          {form.formState.errors.email && (<p className="text-sm text-destructive">{form.formState.errors.email.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="faculty">Faculty</FieldLabel>
          <select
            id="faculty"
            defaultValue=""
            className="text-xs text-muted-foreground bg-background rounded-md border h-6 px-2"
            {...form.register("faculty")}
          >
            <option value="" disabled >Select Faculty</option>
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            className="bg-background"
            placeholder="Must be at least 8 characters long"
            {...form.register("password")}
          />
          {form.formState.errors.password && (<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            className="bg-background"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (<p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>)}
        </Field>


        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            type="text"
            className="bg-background"
            placeholder="e.g. Block 17, Level 1, ENG"
            {...form.register("location")}
          />
          {form.formState.errors.location && (<p className="text-sm text-destructive">{form.formState.errors.location.message}</p>)}
        </Field>

        <Field className="grid grid-cols-2 gap-4">

          <Field>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input
              id="latitude"
              type="number"
              step="any" // <-- Allows decimals in the number input
              className="bg-background"
              // 👇 MUST use valueAsNumber so Zod gets a number, not a string
              {...form.register("latitude", { valueAsNumber: true })} 
            />
            {form.formState.errors.latitude && (<p className="text-sm text-destructive">{form.formState.errors.latitude.message}</p>)}
          </Field>

          <Field>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input
              id="longitude"
              type="number"
              step="any" // <-- Allows decimals
              className="bg-background"
              // 👇 MUST use valueAsNumber
              {...form.register("longitude", { valueAsNumber: true })}
            />
            {form.formState.errors.longitude && (<p className="text-sm text-destructive">{form.formState.errors.longitude.message}</p>)}
          </Field>
          
        </Field>



        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

      </FieldGroup>
    </form>
  )
}
