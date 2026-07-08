"use client"

import { redirect, useRouter } from "next/navigation" // Import useRouter
import { UpdateBinSchema } from "@/schemas"
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
import BinStatusCombobox from "./UpdateBinStatusCombobox"
import BinMaterialCombobox from "@/components/FormLogic/BinMaterialForms/BinMaterialCombobox"
import { Button } from "../../ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Bin, BinMaterial } from "@/generated/prisma"
import { updateBin } from "@/app/action/bin"
import Card from "@/components/Card/Card"
import FormHeader from "../FormHeader"

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
    startTransition(async () => {
      try {
        const result = await updateBin(id, values)
        if (result?.success) {
          toast.success("success",{
            description: `Bin updated at ${datetime}`,
          })
          router.push("/admin/bin")
        } else if (result?.error) {
          toast.error("Error",{
            description: result.error || "Failed to update bin",
            duration: 2000,
          })
        }
      } catch (error) {
        console.error("Update error:", error)
        toast.error("Error",{
          description: "An unexpected error occurred",
          duration: 2000,
        })
      }
    })
  }

  return (
    <Card isAdmin rounded fullWidth>
      <FormHeader>Update bin</FormHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={true}
                    placeholder="Near Library"
                    {...field}
                    type="text"
                    className="bg-gray-200"
                  />
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
                <FormLabel className="font-bold text-slate-700">
                  Status
                </FormLabel>
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
                <FormLabel className="font-bold text-slate-700">
                  Material
                </FormLabel>
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
          <Button
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            type="submit"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Submit"}
          </Button>
        </form>
      </Form>
    </Card>
  )
}


