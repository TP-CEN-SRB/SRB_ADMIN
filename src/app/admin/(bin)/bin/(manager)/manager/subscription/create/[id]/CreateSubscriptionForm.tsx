"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useState, useTransition } from "react"
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
import { ArrowLeft, Loader2 } from "lucide-react"
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionSchema } from "@/schemas"
import { createSubscription } from "@/app/action/subscription"

interface CreateSubscriptionFormProps {
  id: string
}
const CreateSubscriptionForm = ({ id }: CreateSubscriptionFormProps) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof SubscriptionSchema>>({
    resolver: zodResolver(SubscriptionSchema),
    defaultValues: {
      email: "",
    },
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const onSubmit = (values: z.infer<typeof SubscriptionSchema>) => {
    startTransition(async function(){
      setError("") // clear error message
      const data = await createSubscription(values, id)
      setError(data?.error as string)
      setSuccess(data?.success as string)
      if (!data?.error && data?.success !== undefined) {
        form.reset({ email: "" })
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

export default CreateSubscriptionForm
