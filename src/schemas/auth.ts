import { maxBound } from "@/utils/map"
import { Faculty } from "@/generated/prisma"
import * as z from "zod"
// todo: uncomment the email validation after demonstration
/**
 * All
 */
const { minLat, maxLat, minLong, maxLong } = maxBound

/**
 * Admins
 */
const SignUpAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .endsWith("@tp.edu.sg", "Please use an approved TP staff email"),
  faculty: z.nativeEnum(Faculty, { message: "Invalid faculty" }),
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
})

/**
 * Students + Admins
 */
const ResetSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
})

const NewAdminPasswordSchema = SignUpAdminSchema.pick({ password: true })

/**
 * Bins
 */
const SignUpBinSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .endsWith("@tp.bin.sg", "Please ensure your bin ends with @tp.bin.sg")
    .toLowerCase(),
  faculty: z.nativeEnum(Faculty, { message: "Invalid faculty" }),
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
  location: z
    .string()
    .regex(/^[A-Za-z0-9\s,]+$/, "Invalid. Accepted: letters, numbers, commas")
    .min(2, "Location is too short"),
  latitude: z.coerce
    .number({ message: "Latitude must be a number" })
    .refine((val) => /^-?\d{1,3}(\.\d{1,7})?$/.test(val.toString()), {
      message:
        "Invalid latitude. Up to 7 decimal places and a maximum of 3 digits before the decimal point is allowed",
    })
    .refine(
      (val) => val >= minLat && val <= maxLat,
      `Latitude must be between ${minLat} and ${maxLat}`
    ),

  longitude: z.coerce
    .number({ message: "Longitude must be a number" })
    .refine((val) => /^-?\d{1,3}(\.\d{1,7})?$/.test(val.toString()), {
      message:
        "Invalid longitude. Up to 7 decimal places and a maximum of 3 digits before the decimal point is allowed",
    })
    .refine((val) => val >= minLong && val <= maxLong, {
      message: `Longitude must be between ${minLong} and ${maxLong}`,
    }),
})
const BinPasswordSchema = z.discriminatedUnion("isExistingPassword", [
  z.object({
    isExistingPassword: z.literal(true),
  }),
  z.object({
    isExistingPassword: z.literal(false),
    password: z
      .string()
      .regex(/^\S*$/, "Password cannot contain spaces")
      .min(8, "Password must be at least 8 characters"),
  }),
])

const UpdateBinSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is too short")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
    email: z.string().email("Please enter a valid email address").toLowerCase(),
    faculty: z.nativeEnum(Faculty, { message: "Invalid faculty" }),
    location: z
      .string()
      .regex(/^[A-Za-z0-9\s,]+$/, "Invalid. Accepted: letters, numbers, commas")
      .min(2, "Location is too short"),
    latitude: z.coerce
      .number({ message: "Latitude must be a number" })
      .refine((val) => /^-?\d{1,3}(\.\d{1,7})?$/.test(val.toString()), {
        message:
          "Invalid latitude. Up to 7 decimal places and a maximum of 3 digits before the decimal point is allowed",
      })
      .refine(
        (val) => val >= minLat && val <= maxLat,
        `Latitude must be between ${minLat} and ${maxLat}`
      ),

    longitude: z.coerce
      .number({ message: "Longitude must be a number" })
      .refine((val) => /^-?\d{1,3}(\.\d{1,7})?$/.test(val.toString()), {
        message:
          "Invalid longitude. Up to 7 decimal places and a maximum of 3 digits before the decimal point is allowed",
      })
      .refine((val) => val >= minLong && val <= maxLong, {
        message: `Longitude must be between ${minLong} and ${maxLong}`,
      }),
  })
  .and(BinPasswordSchema)

/**
 * Students
 */

const SignUpStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    // .regex(/^\d{7}@student\.tp\.edu\.sg$/, "Please use your personal TP email")
    .toLowerCase(),
  faculty: z.nativeEnum(Faculty, { message: "Invalid faculty" }),
  diploma: z.string().min(1, "Diploma is required"), 
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
})


const UpdateStudentSchema = SignUpStudentSchema.omit({
  password: true,
  confirmPassword: true,
}).extend({
  points: z.coerce
    .number({ message: "Points must be a number" })
    .int("Points must be an integer")
    .max(2147483647, "Maximum value is 2147483647")
    .gte(0, "Points cannot be negative"),
})
const NewStudentPasswordSchema = SignUpStudentSchema.pick({
  password: true,
  confirmPassword: true,
})

export {
  SignUpAdminSchema,
  SignUpBinSchema,
  SignUpStudentSchema,
  UpdateStudentSchema,
  ResetSchema,
  NewAdminPasswordSchema,
  UpdateBinSchema,
  NewStudentPasswordSchema,
}
