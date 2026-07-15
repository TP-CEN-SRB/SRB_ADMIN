import * as z from "zod" 

export const EditMemberSchema = z.object({
  name: z.string()
    .min(3, { error: "Username must be at least 3 characters long." })
    .max(20, { error: "Username must be less than 20 characters long." }),

  email: z.email({ error: "Email is required." }),

  password: z.string().min(8, { error: "Password must be at least 8 characters long." }).optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  
  faculty: z.enum(["ENG", "BUS", "ASC", "DES", "HSS", "IIT", "OTHERS", "EXT"], { error: "Please select a faculty." }),

  role: z.enum(["ADMIN", "STUDENT", "STAFF", "STORE", "BIN"], { 
    error: "Please select a role." 
  }),
}).refine(function(data){ return data.password === data.confirmPassword}, {error: "Passwords do not match.",path: ["confirmPassword"],})

export type EditMemberFormValue = z.infer<typeof EditMemberSchema>