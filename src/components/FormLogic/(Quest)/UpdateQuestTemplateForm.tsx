// "use client"

// import { useState, useTransition } from "react"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import Card from "@/components/Card/Card"
// import FormHeader from "../FormHeader"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { QuestTemplateSchema } from "@/schemas"
// import { updateQuestTemplate } from "@/app/action/questTemplate"

// import {
//   Form,
//   FormField,
//   FormControl,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form"

// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Button } from "@/components/ui/button"
// import { Loader2 } from "lucide-react"
// import CustomFormMessage from "../CustomFormMessage"

// interface Props {
//   id: string
//   template: {
//     title: string
//     description: string
//     target: number
//     rewardPoints: number
//     materialType: string
//     duration: number
//   }
// }

// export default function UpdateQuestTemplateForm({ id, template }: Props) {
//   const [isPending, startTransition] = useTransition()

//   // --------------------------------------------
//   // NEW: Error & Success States
//   // --------------------------------------------
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")

//   const materialOptions = [
//     { label: "Plastic", value: "PLASTIC" },
//     { label: "Metal", value: "METAL" },
//     { label: "Paper", value: "PAPER" },
//     { label: "E-Waste", value: "E_WASTE" },
//     { label: "General", value: "GENERAL" },
//   ]

//   const form = useForm<z.infer<typeof QuestTemplateSchema>>({
//     resolver: zodResolver(QuestTemplateSchema),
//     defaultValues: {
//       title: template.title,
//       description: template.description,
//       target: template.target,
//       rewardPoints: template.rewardPoints,
//       materialType: template.materialType as
//         | "PLASTIC"
//         | "METAL"
//         | "PAPER"
//         | "E_WASTE"
//         | "GENERAL",
//       duration: template.duration,
//     },
//   })

//   const onSubmit = (values: z.infer<typeof QuestTemplateSchema>) => {
//     startTransition(async () => {
//       setError("")
//       setSuccess("")

//       const res = await updateQuestTemplate(id, values)

//       if (res?.success) {
//         setSuccess("Quest Template updated successfully!")
//         form.reset(values) // keep updated values
//       } else {
//         setError(res?.error || "Failed to update quest template.")
//       }
//     })
//   }

//   return (
//     <Card isAdmin rounded fullWidth>
//       <FormHeader>Update Quest Template</FormHeader>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

//           {/* Title */}
//           <FormField
//             control={form.control}
//             name="title"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-bold text-slate-700">Title</FormLabel>
//                 <FormControl>
//                   <Input disabled={isPending} placeholder="Template title" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Description */}
//           <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-bold text-slate-700">Description</FormLabel>
//                 <FormControl>
//                   <Textarea
//                     disabled={isPending}
//                     placeholder="Describe this quest template..."
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Row: Target + Reward */}
//           <div className="grid grid-cols-2 gap-4">

//             {/* Target */}
//             <FormField
//               control={form.control}
//               name="target"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="font-bold text-slate-700">Target</FormLabel>
//                   <FormControl>
//                     <Input type="number" min={1} disabled={isPending} {...field} />
//                   </FormControl>
//                   <FormDescription>Required amount of grams</FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Reward */}
//             <FormField
//               control={form.control}
//               name="rewardPoints"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="font-bold text-slate-700">Reward Points</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       min={0}
//                       disabled={isPending}
//                       value={field.value}
//                       onChange={field.onChange}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           {/* Material */}
//           <FormField
//             control={form.control}
//             name="materialType"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-bold text-slate-700">Material Type</FormLabel>
//                 <FormControl>
//                   <select
//                     disabled={isPending}
//                     {...field}
//                     className="w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm"
//                   >
//                     {materialOptions.map((m) => (
//                       <option key={m.value} value={m.value}>
//                         {m.label}
//                       </option>
//                     ))}
//                   </select>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Duration */}
//           <FormField
//             control={form.control}
//             name="duration"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="font-bold text-slate-700">Duration (days)</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     min={1}
//                     disabled={isPending}
//                     placeholder="e.g. 7"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormDescription>How long this quest lasts</FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* NEW: Error & Success messages */}
//           {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
//           {success && <CustomFormMessage type="Success">{success}</CustomFormMessage>}

//           {/* Submit */}
//           <Button
//             disabled={isPending}
//             className="w-full bg-indigo-600 hover:bg-indigo-700"
//             type="submit"
//           >
//             {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             {isPending ? "Updating..." : "Update Template"}
//           </Button>
//         </form>
//       </Form>
//     </Card>
//   )
// }
