import * as z from "zod" 

export const signupBinSchema = z.object({
    name: z.string()
        .min(3, { error: "Username must be at least 3 characters long." })
        .max(20, { error: "Username must be less than 20 characters long." }),

    email: z.email({ error: "Email is required." })
        .endsWith("tp.bin.sg", { error: "Please ensure bin email ends with @tp.bin.sg" })
        .toLowerCase(),

    password: z.string()
        .min(8, { error: "Password must be at least 8 characters long." }),
  
    confirmPassword: z.string(),

    faculty: z.enum(["ENG", "BUS", "ASC", "DES", "HSS", "IIT", "OTHERS", "EXT"], { error: "Please select a faculty." }),

    location: z.string()
        .min(2, { message: "Location is too short" })
        .regex(/^[A-Za-z0-9\s,]+$/, { message: "Invalid. Accepted: letters, numbers, commas" }),

    latitude: z.number({ message: "Latitude must be a number" })
        .min(-90, { message: "Latitude must be between -90 and 90" })
        .max(90, { message: "Latitude must be between -90 and 90" }),

    longitude: z.number({ message: "Longitude must be a number" })
        .min(-180, { message: "Longitude must be between -180 and 180" })
        .max(180, { message: "Longitude must be between -180 and 180" }),
}).refine(function(data){ return data.password === data.confirmPassword}, {error: "Passwords do not match.",path: ["confirmPassword"],})


export type SignupBinFormValue = z.infer<typeof signupBinSchema>

export const editBinSchema = z.object({
    name: z.string()
        .min(3, { error: "Username must be at least 3 characters long." })
        .max(20, { error: "Username must be less than 20 characters long." }),

    email: z.email({ error: "Email is required." })
        .endsWith("tp.bin.sg", { error: "Please ensure bin email ends with @tp.bin.sg" })
        .toLowerCase(),

    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .optional()
        .or(z.literal("")),
  
    // 👇 THE FIX: Allow confirmPassword to be empty as well
    confirmPassword: z.string()
        .optional()
        .or(z.literal("")),

    faculty: z.enum(["ENG", "BUS", "ASC", "DES", "HSS", "IIT", "OTHERS", "EXT"], { error: "Please select a faculty." }),

    location: z.string()
        .min(2, { message: "Location is too short" })
        .regex(/^[A-Za-z0-9\s,]+$/, { message: "Invalid. Accepted: letters, numbers, commas" }),

    lat: z.number({ message: "Latitude must be a number" })
        .min(-90, { message: "Latitude must be between -90 and 90" })
        .max(90, { message: "Latitude must be between -90 and 90" }),

    long: z.number({ message: "Longitude must be a number" })
        .min(-180, { message: "Longitude must be between -180 and 180" })
        .max(180, { message: "Longitude must be between -180 and 180" }),
}).refine((data) => {
    if (data.password && data.password !== "") {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
})
export type EditBinFormValue = z.infer<typeof editBinSchema>