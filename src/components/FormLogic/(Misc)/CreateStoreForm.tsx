"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { signupSchema, SignupFormValue } from "@/lib/zod-schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useRouter } from "next/navigation"
import { getSignUp } from "@/lib/auth-server"

export function CreateStoreForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
    const { 
      register,
      handleSubmit,
      setError, 
      formState: { errors, isSubmitting }
    } = useForm<SignupFormValue>({
      resolver: zodResolver(signupSchema),
    })
    const router = useRouter()
    
    async function onSubmitRegister(data: SignupFormValue){

      const result = await getSignUp(data)

      if (result.error){
        setError("root", { message: result.error })
      }
      if (result.success){
        router.push("/admin/store")
      }
    }

  return (
    <form onSubmit={handleSubmit(onSubmitRegister)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create store</h1>
          <p className="text-xs text-balance text-muted-foreground">
            Enter your details below to create tp store
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="name"
            placeholder="Drink Store"
            {...register("name")}
          />
          {errors.name && (<p className="text-xs text-destructive">{errors.name.message}</p>)}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
          />
          {errors.email && (<p className="text-xs text-destructive">{errors.email.message}</p>)}
        </Field>
      
        <Field>
          <FieldLabel htmlFor="faculty">Faculty</FieldLabel>
          <select
            id="faculty"
            defaultValue=""
            className="text-xs text-muted-foreground bg-background rounded-md border h-6 px-2"
            {...register("faculty")}
          >
            <option value="" disabled >Select Faculty</option>
            <option value="ENG">ENG</option>
            <option value="BUS">BUS</option>
            <option value="ASC">ASC</option>
            <option value="DES">DES</option>
            <option value="HSS">HSS</option>
            <option value="IIT">IIT</option>
            <option value="OTHERS">OTHERS</option>
            <option value="EXT">EXTERNAL</option>
          </select>
          {errors.faculty && (<p className="text-sm text-destructive">{errors.faculty.message}</p>)}
        </Field>

        <Field>
          <Field className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" {...register("password")}/>
              {errors.password && (<p className="text-xs text-destructive">{errors.password.message}</p>)}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" {...register("confirmPassword")}/>
              {errors.confirmPassword && (<p className="text-xs text-destructive">{errors.confirmPassword.message}</p>)}
            </Field>
          </Field>
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>

        <input type="hidden" {...register("role")} value="STORE" />

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Create Store"}
          </Button>
          {errors.root && (<p className="text-xs text-destructive text-center">{errors.root.message}</p>)}
        </Field>

      </FieldGroup>
    </form>
  )
}
