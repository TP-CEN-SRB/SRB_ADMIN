import { BinMaterial, BinStatus, Faculty } from "@prisma/client";
import * as z from "zod";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  // .endsWith("@tp.edu.sg", "Please use your personal TP email"),
  password: z.string().min(1, "Password is required"),
});

const SignUpSchema = z.object({
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
  secondaryPassword: z
    .string()
    .regex(/^\d{6}$/, "Secondary password must be 6 digits"),
  location: z
    .string()
    .regex(
      /^[A-Za-z0-9\s,]+$/,
      "Location can only contain letters, numbers, spaces, and commas"
    ),
});
const SecondaryPasswordSchema = z.object({
  secondaryPassword: z
    .string()
    .regex(/^\d{6}$/, "Secondary password must be 6 digits"),
});
const AdminNumberSchema = z.object({
  adminNumber: z.string().regex(/^\d{7}[A-Za-z]$/, "Invalid admin number"),
});
const ResetSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  // .endsWith("@tp.edu.sg", "Please use your personal TP email"),
});

const NewPasswordSchema = z.object({
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
});

const BinSchema = z.object({
  location: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  status: z.nativeEnum(BinStatus, { message: "Invalid status" }),
  material: z.nativeEnum(BinMaterial, { message: "Invalid material" }),
  userId: z.string().min(1, "User ID is required"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.nativeEnum(BinMaterial, { message: "Invalid material" }),
});

export {
  LoginSchema,
  SignUpBinSchema,
  SignUpSchema,
  SecondaryPasswordSchema,
  ResetSchema,
  NewPasswordSchema,
  BinSchema,
  DisposalSchema,
  AdminNumberSchema,
};
