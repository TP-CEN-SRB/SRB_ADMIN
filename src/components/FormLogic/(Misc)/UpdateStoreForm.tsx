"use client"

import { useRouter } from "next/navigation"
import { UpdateStoreSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { updateStore } from "@/app/action/store"

const FacultyEnum = ["ENG", "BUS", "ASC", "IIT", "HSS", "DES", "OTHERS", "EXT"] as const

interface UpdateStoreFormProps {
  id: string
  store: {
    name: string
    email: string
    faculty: string
  }
}

const UpdateStoreForm = ({ id, store }: UpdateStoreFormProps) => {
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const form = useForm<z.infer<typeof UpdateStoreSchema>>({
    resolver: zodResolver(UpdateStoreSchema),
    defaultValues: {
      name: store.name,
      email: store.email,
      faculty: store.faculty,
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (values: z.infer<typeof UpdateStoreSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    })

    startTransition(async function(){
      try {
        const result = await updateStore(id, values)

        if (result?.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof typeof values, {
              type: "manual",
              message: messages?.[0] || "Invalid input",
            })
          }
        }

        if (result?.success) {
          toast.success("Success", {
            description: `Store updated at ${datetime}`,
          })
          router.push("/admin/store")
        } else if (result?.error) {
          toast.error("Error", {
            description: result.error,
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "Unexpected error occurred",
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isPending} {...field} />
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
                <Input type="email" disabled={isPending} {...field} />
              </FormControl>
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
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
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
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="faculty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a faculty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FacultyEnum.map((fac) => (
                    <SelectItem key={fac} value={fac}>
                      {fac}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}

export default UpdateStoreForm
