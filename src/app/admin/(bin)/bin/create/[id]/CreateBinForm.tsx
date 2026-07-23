"use client"

import { BinSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useTransition, useState } from "react"
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
import BinStatusCombobox from "./CreateBinStatusCombobox"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { BinMaterial, BinStatus } from "@/generated/prisma"
import { createBin } from "./action"
import { redirect, useRouter } from "next/navigation"
import BinMaterialCheckBox from "./BinMaterialCheckbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateBinFormProps {
  materials: BinMaterial[]
  binUserId: string
  binLocation: string | undefined | null
  usedBinMaterials: { id: string; name: string }[]
}

const CreateBinForm = ({
  materials,
  binUserId,
  binLocation,
  usedBinMaterials,
}: CreateBinFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof BinSchema>>({
    resolver: zodResolver(BinSchema),
    defaultValues: {
      location: binLocation || "",
      status: BinStatus.FUNCTIONAL,
      materialIds: [],
    },
  })

  const onSubmit = (values: z.infer<typeof BinSchema>) => {
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false, // 24-hour format, remove if 12-hour format is needed
    })
    startTransition(async function(){
      const result = await createBin(values, binUserId)
      if (result?.success) {
        toast("Bin created successfully",{
          description: `Bin created at ${datetime}`,
          duration: 2000,
        })
        // Reset the form, including clearing materialIds
        form.reset({
          location: "",
          status: BinStatus.FUNCTIONAL,
          materialIds: [],
        })
        redirect("/admin/bin")
      } else if (result?.error) {
        toast.error("Error creating bin",{
          description: result?.error,
          duration: 2000,

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
          <CardTitle>Add a bin</CardTitle>
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
                      <Input
                        disabled={true}
                        placeholder="Near Library"
                        {...field}
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material(s)</FormLabel>
                    <FormControl>
                      <BinMaterialCheckBox
                        materials={materials}
                        usedBinMaterials={usedBinMaterials}
                        field={field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} className="w-full" type="submit">
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

export default CreateBinForm
