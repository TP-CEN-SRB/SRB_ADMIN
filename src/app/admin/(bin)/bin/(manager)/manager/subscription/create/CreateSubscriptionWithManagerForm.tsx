"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createSubscription } from "@/app/action/subscription"

const CreateSubscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  userId: z.string().min(1, "Please select a bin manager"),
})

interface BinManagerOption {
  id: string
  name: string
  location: string | null
}

export default function CreateSubscriptionWithManagerForm({ binManagers }: { binManagers: BinManagerOption[] }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateSubscriptionSchema>>({
    resolver: zodResolver(CreateSubscriptionSchema),
    defaultValues: { email: "", userId: "" },
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const onSubmit = (values: z.infer<typeof CreateSubscriptionSchema>) => {
    startTransition(async function () {
      setError("")
      const data = await createSubscription({ email: values.email }, values.userId)
      setError(data?.error as string)
      setSuccess(data?.success as string)
      if (!data?.error && data?.success !== undefined) {
        form.reset({ email: "", userId: "" })
        router.push("/admin/bin/manager/subscription")
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 size-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add a subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bin Manager</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a bin manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {binManagers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} {manager.location ? `— ${manager.location}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="johndoe@tp.edu.sg"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
              {success && (
                <CustomFormMessage type="Success">{success}</CustomFormMessage>
              )}
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
                {isPending ? "Loading..." : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
