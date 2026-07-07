"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { useState } from "react"
import { useForm } from "react-hook-form"

import { authClient } from "@/lib/auth-client"
import { signupSchema, SignupFormValue } from "./auth-schema"
import { zodResolver } from "@hookform/resolvers/zod"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<SignupFormValue>({resolver: zodResolver(signupSchema)})

  async function onSubmit(signUpData: SignupFormValue){
    setIsPending(true)
    setServerError(null)

    const { data, error } = await authClient.signUp.email({
      email: signUpData.email,
      password: signUpData.password,
      name: signUpData.name,
      faculty: signUpData.faculty,
      role: signUpData.role
    })

    if (error) {
      setServerError(error.message || "Failed to create account.")
      setIsPending(false)
      return
    }

    router.push("/login") 
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


        <Field className="grid grid-cols-2 gap-4">
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
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <select
              id="role"
              defaultValue=""
              className="text-xs text-muted-foreground bg-background rounded-md border h-6 px-2"
              {...form.register("role")}
            >
              <option value="" disabled >Select Role</option>
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
            </select>
            {form.formState.errors.role && (<p className="text-sm text-destructive">{form.formState.errors.role.message}</p>)}
          </Field>
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
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/login">Login</Link>
          </FieldDescription>
        </Field>

      </FieldGroup>
    </form>
  )
}
