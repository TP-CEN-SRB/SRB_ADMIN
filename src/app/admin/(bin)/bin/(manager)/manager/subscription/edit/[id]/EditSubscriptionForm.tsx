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
import { ArrowLeft, Loader2 } from "lucide-react"
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { SubscriptionSchema } from "@/schemas"
import { updateSubscription } from "@/app/action/subscription"

interface EditSubscriptionFormProps {
  id: string
  email: string
}
const EditSubscriptionForm = ({ id, email }: EditSubscriptionFormProps) => {
  const form = useForm<z.infer<typeof SubscriptionSchema>>({
    resolver: zodResolver(SubscriptionSchema),
    defaultValues: {
      email,
    },
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()
  const onSubmit = (values: z.infer<typeof SubscriptionSchema>) => {
    startTransition(async function(){
      setError("") // clear error message
      const data = await updateSubscription(values, id)
      setError(data?.error as string)
      if (!data?.error && data?.success !== undefined) {
        router.push(`/admin/bin/manager/subscription/${data.userId}`)
        toast.success("success!",{
          description: `${data.success}`,
        })
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
          <CardTitle>Update subscription</CardTitle>
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

export default EditSubscriptionForm
