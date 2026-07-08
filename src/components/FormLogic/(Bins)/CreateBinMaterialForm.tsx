// "use client"

// import Card from "@/components/Card/Card"
// import React, { useState, useTransition } from "react"
// import FormHeader from "../FormHeader"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { BinMaterialSchema } from "@/schemas"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { toast } from "sonner"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Loader2 } from "lucide-react"
// import { createBinMaterial } from "@/app/action/binMaterial"
// import CustomFormMessage from "../CustomFormMessage"

// const CreateBinMaterialForm = () => {
//   const [isPending, startTransition] = useTransition()
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")
//   const form = useForm<z.infer<typeof BinMaterialSchema>>({
//     resolver: zodResolver(BinMaterialSchema),
//     defaultValues: {
//       name: "",
//       multiplier: undefined,
//     },
//   })

//   const onSubmit = (values: z.infer<typeof BinMaterialSchema>) => {
//     const datetime = new Date().toLocaleString("en-SG", {
//       timeZone: "Asia/Singapore",
//       hour12: false, // 24-hour format, remove if 12-hour format is needed
//     })
//     startTransition(async () => {
//       setError("")
//       setSuccess("")
//       const result = await createBinMaterial(values)
//       if (result?.success) {
//         setSuccess(result?.success)
//         // toast({
//         //   title: "Bin Material created successfully",
//         //   description: `Material created at ${datetime}`,
//         //   duration: 2000,
//         //   variant: "default",
//         // })
//         form.reset({
//           name: "",
//           multiplier: 0,
//         })
//         //redirect("/admin/bin")
//       } else if (result?.error) {
//         setError(result?.error)
//         // toast({
//         //   title: "Error creating bin",
//         //   description: result?.error,
//         //   duration: 2000,
//         //   variant: "destructive",
//         // })
//       }
//     })
//   }
//   return (
//     <Card isAdmin rounded fullWidth>
//       <FormHeader>Add a bin material</FormHeader>
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-bold text-slate-700">Name</FormLabel>
//                 <FormControl>
//                   <Input
//                     disabled={isPending}
//                     placeholder="Plastic"
//                     {...field}
//                     type="text"
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="multiplier"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-bold text-slate-700">
//                   Multiplier
//                 </FormLabel>
//                 <FormControl>
//                   <Input
//                     disabled={isPending}
//                     placeholder="1.0"
//                     {...field}
//                     type="number"
//                   />
//                 </FormControl>
//                 <FormDescription>
//                   Sets the points earned per gram of material recycled
//                 </FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
//           {success && (
//             <CustomFormMessage type="Success">{success}</CustomFormMessage>
//           )}
//           <Button
//             disabled={isPending}
//             className="w-full bg-emerald-600 hover:bg-emerald-700"
//             type="submit"
//           >
//             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
//             {isPending ? "Loading..." : "Submit"}
//           </Button>
//         </form>
//       </Form>
//     </Card>
//   )
// }

// export default CreateBinMaterialForm
