"use client"
import { EditMemberSchema, EditMemberFormValue } from "./schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { updateMember } from "./updateMember"

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
    const { 
          register,
          handleSubmit,
          setError, 
          formState: { errors, isSubmitting }
        } = useForm<EditMemberFormValue>({
          resolver: zodResolver(EditMemberSchema),
          defaultValues,
        })
        const router = useRouter()

    async function onSubmitUpdate(data: EditMemberFormValue){
    
            const result = await updateMember(id, data)
    
            if (result.error){
            setError("root", { message: result.error })
            }
            if (result.success){
            router.push("/admin/member")
            }
        }

    return (
    <form
      onSubmit={handleSubmit(onSubmitUpdate)}
      className={className}
      {...props}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password (leave blank for unchanged)</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="faculty">Faculty</Label>
        <select id="faculty" {...register("faculty")} className="...">
          <option value="ENG">ENG</option>
          <option value="BUS">BUS</option>
          <option value="ASC">ASC</option>
          <option value="DES">DES</option>
          <option value="HSS">HSS</option>
          <option value="IIT">IIT</option>
          <option value="OTHERS">OTHERS</option>
          <option value="EXT">EXTERNAL</option>
        </select>
        {errors.faculty && <p className="text-sm text-destructive">{errors.faculty.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">System Role</Label>
        <select id="role" {...register("role")} className="...">
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
        </select>
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>

    )
}