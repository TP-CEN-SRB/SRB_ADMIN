"use client"
import React, { useTransition, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ResetSchema } from "@/schemas/auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/app/action/user"
import FormHeader from "@/components/FormLogic/FormHeader"
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage"
import { toast } from "sonner"
import Card from "@/components/Card/Card"
import { useRouter } from "next/navigation"

const ResetPasswordForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    startTransition(async () => {
      setError("") // clear error message
      const data = await resetPassword(values)
      setError(data?.error as string)
      setSuccess(data?.success as string)
      if (!data?.error && data?.success !== undefined) {
        toast("Hey there!",{
          description: `A reset password email has been sent to ${values.email.toLowerCase()}`,
        })
        setTimeout(() => {
          window.close()
        }, 5000)
      }
    })
  }
  return (
    <Card fullWidth rounded>
      <FormHeader>Forgot Password</FormHeader>
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
                <FormDescription>
                  We will send you an email to reset password
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
          {success && (
            <CustomFormMessage type="Success">
              {success} <br />
              If nothing happens, this window will close in 5 seconds
            </CustomFormMessage>
          )}
          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-50"
            type="submit"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Send email"}
          </Button>
        </form>
      </Form>
    </Card>
  )
}

export default ResetPasswordForm
