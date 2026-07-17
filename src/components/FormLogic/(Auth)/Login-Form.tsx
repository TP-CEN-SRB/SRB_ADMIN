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
import { CheckCircle, Mail } from "lucide-react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { useState } from "react"
import { useForm } from "react-hook-form"

import { authClient } from "@/lib/auth-client"
import { loginSchema, LoginFormValue } from "./auth-schema"
import { zodResolver } from "@hookform/resolvers/zod"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const router = useRouter()
  
  // Login states
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  
  // Password Reset states
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const form = useForm<LoginFormValue>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  // --- Handlers ---
  
  async function onSubmit(loginData: LoginFormValue) {
    setIsPending(true)
    setServerError(null)

    const { data, error } = await authClient.signIn.email({
      email: loginData.email,
      password: loginData.password,
      callbackURL: "/admin",
    })

    if (error) {
      setServerError(error.message || "Failed to login.")
      setIsPending(false)
      return
    }
    
    // Optional: router.push('/admin') if the auth client doesn't auto-redirect
  }

  async function handleSendReset() {
    const email = form.getValues("email")
    if (!email) return

    setIsSendingReset(true)
    setServerError(null)

    // Adjust this method call based on your specific authClient's API (e.g., forgetPassword, resetPasswordEmail, etc.)
    const { error } = await authClient.requestPasswordReset({
      email: email,
      redirectTo: "/reset-password", 
    })

    setIsSendingReset(false)

    if (error) {
      setServerError(error.message || "Failed to send reset email.")
    } else {
      setResetSent(true)
      // Optional: Reset the success state back to normal after 3 seconds
      setTimeout(() => setResetSent(false), 3000)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
        </div>
        
        {serverError && (
          <div className="text-sm text-red-500 text-center font-medium">
            {serverError}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="bg-background"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={handleSendReset}
                disabled={isSendingReset || resetSent || !form.watch("email")}
            >
                {isSendingReset ? (
                  "Sending..."
                ) : resetSent ? (
                  <span className="flex items-center text-green-500">
                    <CheckCircle className="mr-1.5 size-3.5" /> Sent to your email
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Mail className="mr-1.5 size-3.5" /> Forgot password?
                  </span>
                )}
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Must be at least 8 characters long"
            className="bg-background"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isPending} className="w-full mt-2">
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary transition-colors">
              Sign up
            </Link>
          </FieldDescription>
        </Field>

      </FieldGroup>
    </form>
  )
}