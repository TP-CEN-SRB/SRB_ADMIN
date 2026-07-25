"use client"

import { useRouter } from "next/navigation"
import { UpdateBinSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import BinStatusCombobox from "./UpdateBinStatusCombobox"
import BinMaterialCombobox from "./BinMaterialCombobox"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Bin, BinMaterial } from "@/generated/prisma"
import { updateBin } from "./action"

interface UpdateBinFormProps {
  id: string
  initialData: Bin
  materials: BinMaterial[]
  location: string
  binMaterialName: string
}

export default function UpdateBinForm({
  id,
  initialData,
  materials,
  location,
  binMaterialName,
}: UpdateBinFormProps){
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const form = useForm<z.infer<typeof UpdateBinSchema>>({
    resolver: zodResolver(UpdateBinSchema),
    defaultValues: {
      location,
      status: initialData.status,
      materialId: initialData.binMaterialId,
    },
  })

  const onSubmit = (values: z.infer<typeof UpdateBinSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false,
    })
    startTransition(async function(){
      try {
        const result = await updateBin(id, values)
        if (result?.success) {
          toast.success("Success", {
            description: `Bin updated at ${datetime}`,
          })
          router.push("/admin/bin")
        } else if (result?.error) {
          toast.error("Error", {
            description: result.error || "Failed to update bin",
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "An unexpected error occurred",
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bin Details</CardTitle>
        <CardDescription>Update this bin&apos;s status and material.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Near Library" {...field} type="text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <BinStatusCombobox field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <BinMaterialCombobox
                      materials={materials}
                      field={field}
                      currentFieldName={binMaterialName}
                    />
                  </FormControl>
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
      </CardContent>
    </Card>
  )
}
