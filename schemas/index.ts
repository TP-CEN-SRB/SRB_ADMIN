import { BinStatus } from "@prisma/client";
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
  material: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  userId: z.string().min(1, "User ID is required"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
});

const RewardSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  pointsRequired: z.coerce
    .number({ message: "Points must be a number" })
    .int("Points must be an integer")
    .gte(1, "Points cannot be negative"),
  description: z.string().min(2, "Description is too short"),
  image: z
    .instanceof(File, { message: "Image is required" })
    .refine((file: File) => file.size !== 0, "Image is required")
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size should not exceed ${
        MAX_FILE_SIZE / (1024 * 1024)
      } MB`,
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png, and .webp files are accepted",
    }),
});

export { BinSchema, DisposalSchema, RewardSchema };
