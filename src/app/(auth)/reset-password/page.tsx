import { Suspense } from "react"
import { ResetPasswordForm } from "./ResetPassword-Form"

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-screen">
      <Suspense fallback={<div className="mt-20 text-muted-foreground">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}