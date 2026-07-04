import * as z from "zod"; 

export const signupSchema = z.object({
  name: z.string()
    .min(3, { error: "Username must be at least 3 characters long." })
    .max(20, { error: "Username must be less than 20 characters long." }),

  email: z.email({ error: "Email is required." })
    .endsWith("tp.edu.sg", { error: "Please use an approved TP staff email" }),

  password: z.string()
    .min(8, { error: "Password must be at least 8 characters long." }),

  confirmPassword: z.string(),
  
  faculty: z.enum(["ENG", "BUS", "ASC", "DES", "HSS", "IIT", "OTHERS", "EXTERNAL"], { error: "Please select a faculty." }),

  role: z.enum(["STUDENT", "STAFF"], { error: "Please select a role." }),
}).refine(function(data){ return data.password === data.confirmPassword}, {error: "Passwords do not match.",path: ["confirmPassword"],})

export type SignupFormValue = z.infer<typeof signupSchema>


export const loginSchema = z.object({

  email: z.email({ error: "Email is required." })
    .endsWith("tp.edu.sg", { error: "Please use an approved TP staff email" }),

  password: z.string()
    .min(8, { error: "Password must be at least 8 characters long." }),
})

export type LoginFormValue = z.infer<typeof loginSchema>