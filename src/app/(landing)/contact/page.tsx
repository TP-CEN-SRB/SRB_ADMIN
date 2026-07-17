"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"

interface ContactFormValue {
  name: string
  email: string
  message: string
}

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValue>()

  async function onSubmit(data: ContactFormValue) {
    setServerError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setServerError(body?.message || "Failed to send message.")
        return
      }

      setSent(true)
      reset()
    } catch {
      setServerError("Failed to send message.")
    }
  }

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-12 sm:pt-32 sm:pb-16 lg:pb-24 transition-colors duration-300 min-h-screen">
      {/* Background Decorative Vertical Glowing Lines (matching landing page) */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_100%]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[50%] w-[1px] bg-emerald-500/50 shadow-[0_0_30px_5px_rgba(16,185,129,0.4)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[55%] w-[4px] bg-emerald-300 dark:bg-white shadow-[0_0_40px_10px_rgba(52,211,153,0.4)] dark:shadow-[0_0_40px_10px_rgba(255,255,255,0.8)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[58%] w-[2px] bg-emerald-400 shadow-[0_0_30px_5px_rgba(52,211,153,0.5)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-90" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <Badge
            variant="outline"
            className="h-auto rounded-full border-border bg-muted/50 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase backdrop-blur-md"
          >
            <Mail className="mr-2 h-3.5 w-3.5" />
            Get In Touch
          </Badge>

          <h1 className="text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Questions About the <br className="hidden sm:block" />
            <span className="font-bold text-foreground">Smart Bin System?</span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            We&apos;re a Computer Engineering student team from Temasek Polytechnic. Reach out
            with feedback, bug reports, or questions about the project.
          </p>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-5">
          <Card className="md:col-span-2 h-fit">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
              <CardDescription>Other ways to reach the team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground">Use the form and we&apos;ll reply by email.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-foreground">Temasek Polytechnic</p>
                  <p className="text-muted-foreground">School of Engineering, Computer Engineering (T13)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>We usually respond within a few days.</CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle2 className="size-10 text-emerald-500" />
                  <p className="font-medium text-foreground">Message sent — thank you!</p>
                  <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your name"
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Textarea
                      placeholder="How can we help?"
                      rows={5}
                      {...register("message", { required: "Message is required" })}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-sm font-medium text-destructive">{serverError}</p>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 size-4" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
