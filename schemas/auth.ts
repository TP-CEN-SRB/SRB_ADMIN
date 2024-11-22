import { BinMaterial, BinStatus, Faculty } from "@prisma/client";
import * as z from "zod";

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
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  // .endsWith("@tp.edu.sg", "Please use your personal TP email"),
  faculty: z.nativeEnum(Faculty, { message: "Invalid faculty" }),
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
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
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .endsWith("@tp.bin.sg", "Please ensure your bin ends with @tp.bin.sg")
    .toLowerCase(),
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
  location: z.string().min(2, "Location is too short"),
});

const AdminNumberSchema = z.object({
  adminNumber: z.string().regex(/^\d{7}[A-Za-z]$/, "Invalid admin number"),
});

/**
 * Students
 */

const SignUpStudentSchema = z.object({
  name: z
    .string()
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
});

const UpdateStudentSchema = SignUpStudentSchema.omit({
  password: true,
}).extend({
  points: z.coerce
    .number({ message: "Points must be a number" })
    .int("Points must be an integer")
    .gte(1, "Points cannot be negative"),
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
  AdminNumberSchema,
};
