"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import FormHeader from "@/components/FormLogic/FormHeader"
import { Loader2 } from "lucide-react"
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage"
import Card from "@/components/Card/Card"
import { Button } from "@/components/ui/button"
import { SubscriptionSchema } from "@/schemas"
import { createSubscription } from "@/app/action/subscription"

interface CreateSubscriptionFormProps {
  id: string
}
const CreateSubscriptionForm = ({ id }: CreateSubscriptionFormProps) => {
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
    <Card isAdmin rounded fullWidth>
      <FormHeader>Add a subscription</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Email
                </FormLabel>
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
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  )
}

export default CreateSubscriptionForm
