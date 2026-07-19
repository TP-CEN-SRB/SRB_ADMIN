"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
// Replace this with your actual auth client import path!
import { authClient } from "@/lib/auth-client" 

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") // Grabs ?token=... from the URL

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)

    // Call Better Auth's reset password method
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token: token
    })

    setIsSubmitting(false)

    if (resetError) {
      setError(resetError.message || "Failed to reset password. The link may have expired.")
      return
    }

    setSuccess(true)
    
    // Redirect to login after 3 seconds
    setTimeout(function(){
      router.push("/login") // Adjust this to your actual login route
    }, 3000)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto mt-20">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <CheckCircle className="size-12 text-green-500" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Password Reset!</h3>
            <p className="text-muted-foreground text-sm">
              Your password has been successfully updated. Redirecting you to login...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-screen">
      <Suspense fallback={<div className="mt-20 text-muted-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}