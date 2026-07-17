"use client"
import { useState } from "react" // <-- Added useState
import { EditMemberSchema, EditMemberFormValue } from "./schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

// Import your new server action
import { updateMember, sendPasswordResetEmail } from "./updateMember" 
import { Save, Mail, CheckCircle } from "lucide-react"

interface EditMemberFormProps extends React.ComponentProps<"form"> {
  id: string
  defaultValues: Partial<EditMemberFormValue>
}

export default function EditMemberForm({
  id,
  defaultValues,
  className,
  ...props
}: EditMemberFormProps) {
  // Added states for the reset button
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const form = useForm<EditMemberFormValue>({
    resolver: zodResolver(EditMemberSchema),
    defaultValues: {
      ...defaultValues,
      emailVerified: defaultValues.emailVerified ?? false,
    }
  })
  
  const router = useRouter()
  const { isSubmitting } = form.formState

  async function onSubmitUpdate(data: EditMemberFormValue) {
    const result = await updateMember(id, data)

    if (result.error) {
      form.setError("root", { message: result.error })
    }
    if (result.success) {
      router.push("/admin/member")
    }
  }

  // New function to handle the button click
  async function handleSendReset() {
    const currentEmail = form.getValues("email");
    if (!currentEmail) return;

    setIsSendingReset(true);
    const result = await sendPasswordResetEmail(currentEmail);
    
    if (result.error) {
      form.setError("root", { message: result.error });
    } else {
      setResetSent(true);
      // Optional: reset the success message after 3 seconds
      setTimeout(() => setResetSent(false), 3000); 
    }
    setIsSendingReset(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitUpdate)}
        className={`space-y-4 ${className || ""}`}
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Updated Reset Password Button */}
        <div className="py-2">
            <Button 
                type="button" // CRITICAL: Prevents standard form submission
                variant="secondary" 
                onClick={handleSendReset}
                disabled={isSendingReset || resetSent || !form.watch("email")}
            >
                {isSendingReset ? (
                  "Sending..."
                ) : resetSent ? (
                  <><CheckCircle className="mr-2 size-4 text-green-500" /> Sent Successfully</>
                ) : (
                  <><Mail className="mr-2 size-4" /> Send password reset to user</>
                )}
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailVerified"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verified</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(val === "true")} 
                  value={field.value ? "true" : "false"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Verification Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Added root form message display in case of errors */}
        {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
            </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}