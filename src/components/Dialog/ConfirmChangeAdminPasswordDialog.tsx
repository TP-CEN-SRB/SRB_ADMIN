// //@ts-nocheck
// import React, { useState, useTransition } from "react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import {
//   Drawer,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
// } from "@/components/ui/drawer"
// import { Button } from "../ui/button"
// import { toast } from "sonner"
// import { resetPassword } from "@/app/action/user"
// import { Loader2 } from "lucide-react"
// import CustomFormMessage from "../FormLogic/CustomFormMessage"
// import { useMediaQuery } from "react-responsive"
// interface DialogProps {
//   isOpen: boolean
//   handleDialogOpen: () => void
//   email: string
// }
// const ConfirmChangeAdminPasswordDialog = ({
//   isOpen,
//   handleDialogOpen,
//   email,
// }: DialogProps) => {
//   const [isPending, startTransition] = useTransition()
//   const [error, setError] = useState("")
//   const handleConfirm = function(){
//     startTransition(async function(){
//       const data = await resetPassword({ email })
//       setError(data?.error as string)
//       if (!data.error && data.success !== undefined) {
//         handleDialogOpen()
//         toast("Hey there!", {
//           description: `A reset password email has been sent to ${email}`,
//         })
//       }
//     })
//   }
//   const isDesktop = useMediaQuery({
//     query: "(min-width: 768px)",
//   })
//   return isDesktop ? (
//     <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle className="text-3xl">Reset password?</DialogTitle>
//           <DialogDescription className="text-slate-500 mt-4 text-md">
//             We will send you an email with instructions to reset your password
//           </DialogDescription>
//         </DialogHeader>
//         {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}

//         <DialogFooter>
//           <Button
//             disabled={isPending}
//             onClick={handleDialogOpen}
//             type="button"
//             className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
//           >
//             Cancel
//           </Button>
//           <Button
//             disabled={isPending}
//             onClick={handleConfirm}
//             type="button"
//             className="bg-red-500 hover:bg-red-600 text-gray-50"
//           >
//             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
//             {isPending ? "Loading..." : "Confirm"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   ) : (
//     <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
//       <DrawerContent>
//         <DrawerHeader className="text-left">
//           <DrawerTitle className="text-2xl">Reset password?</DrawerTitle>
//           <DrawerDescription className="text-slate-500 text-md">
//             We will send you an email with instructions to reset your password
//           </DrawerDescription>
//         </DrawerHeader>
//         {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
//         <DrawerFooter>
//           <Button
//             disabled={isPending}
//             onClick={handleConfirm}
//             type="button"
//             className="bg-red-500 hover:bg-red-600 text-gray-50"
//           >
//             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
//             {isPending ? "Loading..." : "Confirm"}
//           </Button>
//           <Button
//             disabled={isPending}
//             onClick={handleDialogOpen}
//             type="button"
//             className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
//           >
//             Cancel
//           </Button>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   )
// }

// export default ConfirmChangeAdminPasswordDialog
