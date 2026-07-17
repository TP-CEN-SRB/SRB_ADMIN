"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Recycle, Smartphone, LayoutDashboard, UserPlus, LogIn } from "lucide-react"
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

export default function HeroSection() {
  const { data: session, isPending } = authClient.useSession()
  const isAdmin = session?.user?.role === "admin"

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-12 sm:pt-32 sm:pb-16 lg:pb-24 transition-colors duration-300">
      {/* Background Decorative Vertical Glowing Lines (Neon Vibe) */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden">
        {/* Faint background grid/lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_100%]" />

        {/* Bright center glowing lines */}
        <div className="absolute top-[-10%] bottom-[-10%] left-[60%] w-[1px] bg-emerald-500/50 shadow-[0_0_30px_5px_rgba(16,185,129,0.4)]" />
        {/* Adjusted the white line to adapt to light mode so it remains visible */}
        <div className="absolute top-[-10%] bottom-[-10%] left-[65%] w-[4px] bg-emerald-300 dark:bg-white shadow-[0_0_40px_10px_rgba(52,211,153,0.4)] dark:shadow-[0_0_40px_10px_rgba(255,255,255,0.8)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[68%] w-[2px] bg-emerald-400 shadow-[0_0_30px_5px_rgba(52,211,153,0.5)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[72%] w-[1px] bg-emerald-600/40 shadow-[0_0_20px_2px_rgba(5,150,105,0.3)]" />

        {/* Top and Bottom Fade to blend into the background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col gap-20 px-4 sm:px-6 lg:px-8">

        {/* Hero Header - Left Aligned */}
        <div className="flex max-w-3xl flex-col items-start gap-6 text-left">
          <Badge
            variant="outline"
            className="h-auto rounded-full border-border bg-muted/50 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase backdrop-blur-md"
          >
            <Recycle className="mr-2 h-3.5 w-3.5" />
            Next-Gen Smart Recycling
          </Badge>

          <h1 className="text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            AI-Powered Recycling for a <br className="hidden sm:block" />
            <span className="font-bold text-foreground">Sustainable Future.</span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
            Meet the IoT system that turns waste into rewards. Drop your items, and let our smart bins automatically identify, sort, and calculate your eco-points in real time.
          </p>

          {isPending ? (
            <div className="pt-6 h-12" />
          ) : session ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 h-12 transition-all"
              >
                <Link href="https://tp-cen-srb.github.io/RecycleTP/">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Go to Mobile App
                </Link>
              </Button>

              {isAdmin ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 h-12 transition-all bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Admin Dashboard
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 h-12 transition-all"
              >
                <Link href="/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 h-12 transition-all bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Log In
                </Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}