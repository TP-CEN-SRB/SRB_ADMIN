"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { StoreSchema } from "@/schemas"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createStore } from "@/app/action/store"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

type StoreFormValue = z.infer<typeof StoreSchema>

export function CreateStoreForm() {
  const form = useForm<StoreFormValue>({
    resolver: zodResolver(StoreSchema),
  })
  const { isSubmitting } = form.formState

  async function onSubmitRegister(data: StoreFormValue) {
    const result = await createStore(data)

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        form.setError(field as keyof StoreFormValue, {
          type: "manual",
          message: messages?.[0] || "Invalid input",
        })
      }
    } else if (result.error) {
      form.setError("root", { message: result.error })
    }

    if (result.success) {
      toast.success("Store created", { description: result.success })
      form.reset({ name: "", email: "", faculty: undefined, password: "", confirmPassword: "" })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitRegister)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input placeholder="Drink Store" {...field} />
              </FormControl>
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
                <Input type="email" placeholder="store@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="faculty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ENG">ENG</SelectItem>
                  <SelectItem value="BUS">BUS</SelectItem>
                  <SelectItem value="ASC">ASC</SelectItem>
                  <SelectItem value="DES">DES</SelectItem>
                  <SelectItem value="HSS">HSS</SelectItem>
                  <SelectItem value="IIT">IIT</SelectItem>
                  <SelectItem value="OTHERS">OTHERS</SelectItem>
                  <SelectItem value="EXT">EXTERNAL</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>Must be at least 8 characters long.</FormDescription>

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          <PlusCircle className="mr-2 size-4" />
          {isSubmitting ? "Creating..." : "Create Store"}
        </Button>
      </form>
    </Form>
  )
}
