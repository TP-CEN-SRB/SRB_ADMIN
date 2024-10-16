import { Faculty } from "@prisma/client";
import * as z from "zod";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const SignUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .regex(/^\S*$/, "Password cannot contain spaces")
    .min(8, "Password must be at least 8 characters"),
});

export { LoginSchema, SignUpSchema };
