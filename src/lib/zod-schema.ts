import * as z from "zod" 

export const signupSchema = z.object({
    name: z
    .string()
    .min(3, { error: "Username must be at least 3 characters long." })
    .max(20, { error: "Username must be less than 20 characters long." }),

    email: z
    .email({ error: "Email is required." })
    .endsWith("tp.edu.sg", { error: "Please use an approved TP email" }),

    password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." }),

    confirmPassword: z
    .string(),

    faculty: z
    .enum(["ENG", "BUS", "ASC", "DES", "HSS", "IIT", "OTHERS", "EXT"], { error: "Please select a faculty." }),

    role: z
    .enum(["STUDENT", "STAFF", "BIN", "STORE"], { error: "Please select a role." })
    .optional(),

    location: z
    .string()
    .min(2, { message: "Location is too short" })
    .regex(/^[A-Za-z0-9\s,]+$/, { message: "Invalid. Accepted: letters, numbers, commas" })
    .optional()
    .or(z.literal("")),

    lat: z
    .number({ message: "Latitude must be a number" })
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" })
    .optional(),

    long: z
    .number({ message: "Longitude must be a number" })
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" })
    .optional(),

}).refine(function(data){ return data.password === data.confirmPassword}, {error: "Passwords do not match.",path: ["confirmPassword"],})

export type SignupFormValue = z.infer<typeof signupSchema>
