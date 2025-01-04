import { Faculty } from "@prisma/client";
import * as z from "zod";

// todo: uncomment the email validation after demonstration
/**
 * All
 */
const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Admins
 */
const SignUpAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  // .endsWith("@tp.edu.sg", "Please use your personal TP email"),
  faculty: z.nativeEnum(Faculty, { message: "Invalid faculty" }),
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
});

const UpdateAdminEmailSchema = SignUpAdminSchema.pick({
  email: true,
}).merge(z.object({ password: z.string().min(1, "Password is required") }));

/**
 * Students + Admins
 */
const ResetSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
});

const NewPasswordSchema = SignUpAdminSchema.pick({ password: true });

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
  mqttUrl: z.string().url("Please enter a valid URL"),
});
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
]);

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
    mqttUrl: z.string().url("Please enter a valid URL"),
  })
  .and(BinPasswordSchema);

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
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
});

const UpdateStudentSchema = SignUpStudentSchema.omit({
  password: true,
  confirmPassword: true,
}).extend({
  points: z.coerce
    .number({ message: "Points must be a number" })
    .int("Points must be an integer")
    .gte(0, "Points cannot be negative"),
});

export {
  LoginSchema,
  SignUpAdminSchema,
  UpdateAdminEmailSchema,
  SignUpBinSchema,
  SignUpStudentSchema,
  UpdateStudentSchema,
  ResetSchema,
  NewPasswordSchema,
  UpdateBinSchema,
};
