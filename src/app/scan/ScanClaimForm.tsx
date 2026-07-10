"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"

import { loginSchema, LoginFormValue } from "@/components/FormLogic/(Auth)/auth-schema"
import { zodResolver } from "@hookform/resolvers/zod"

type ClaimResult = {
  totalPoints: number
  totalCarbon: string
  count: number
}

export function ScanClaimForm({ className, ...props }: React.ComponentProps<"form">) {
  const searchParams = useSearchParams()
  const disposalToken = searchParams.get("token")
  const queueId = searchParams.get("queueId")

  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [result, setResult] = useState<ClaimResult | null>(null)

  const form = useForm<LoginFormValue>({ resolver: zodResolver(loginSchema) })

  if (!disposalToken || !queueId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Invalid QR code</h1>
        <p className="text-muted-foreground">
          This link is missing or malformed. Please scan the QR code shown on the bin again.
        </p>
      </div>
    )
  }

  async function onSubmit(loginData: LoginFormValue) {
    setIsPending(true)
    setServerError(null)

    try {
      const loginRes = await fetch("/api/login/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })
      const loginBody = await loginRes.json()

      if (!loginRes.ok) {
        setServerError(loginBody.message || "Failed to login.")
        setIsPending(false)
        return
      }

      const claimRes = await fetch(`/api/disposal/${queueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginBody.token}`,
        },
        body: JSON.stringify({ disposalToken }),
      })
      const claimBody = await claimRes.json()

      if (!claimRes.ok) {
        // Most common case: these points were already claimed (via the app,
        // or an earlier visit to this same page) before this login happened.
        setServerError(
          claimBody.message === "No unredeemed disposals in this queue"
            ? "These points have already been claimed."
            : claimBody.message || "Failed to claim points."
        )
        setIsPending(false)
        return
      }

      setResult({
        totalPoints: claimBody.totalPoints,
        totalCarbon: claimBody.totalCarbon,
        count: claimBody.count,
      })
    } catch {
      setServerError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  if (result) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Points claimed!</h1>
        <p className="text-muted-foreground">
          +{result.totalPoints} points from {result.count} item
          {result.count === 1 ? "" : "s"} ({result.totalCarbon}g CO2 saved)
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Log in to claim your points</h1>
          <p className="text-sm text-muted-foreground">
            Tip: use the RecycleTP app&apos;s built-in scanner next time to skip this step.
          </p>
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
          {form.formState.errors.email && (<p className="text-sm text-destructive">{form.formState.errors.email.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Must be at least 8 characters long"
            className="bg-background"
            {...form.register("password")}
          />
          {form.formState.errors.password && (<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>)}
        </Field>

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Claiming..." : "Log in and claim"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
