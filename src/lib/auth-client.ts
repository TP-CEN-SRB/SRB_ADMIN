'use client'
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"
import { redirect, useRouter } from 'next/navigation'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
})

export function useSignOut() {
  const router = useRouter()

  return async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
    redirect("/login")
  }
}