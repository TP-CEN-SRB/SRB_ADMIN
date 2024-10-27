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
  currentCapacity: z
    .number()
    .min(0, "Current capacity cannot be negative")
    .max(100, "Maximum capacity cannot be above 100"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.nativeEnum(BinMaterial, { message: "Invalid material" }),
});

export {
  LoginSchema,
  SignUpBinSchema,
  SignUpSchema,
  ResetSchema,
  NewPasswordSchema,
  BinSchema,
  DisposalSchema,
};
