import { BinStatus } from "@prisma/client";
import { addDays } from "date-fns";
import * as z from "zod";
export const MAX_FILE_SIZE = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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
  dates: z
    .object(
      {
        from: z.coerce.date({ message: "From date is required" }),
        to: z.coerce.date({ message: "To date is required" }),
      },
      { message: "Dates are required" }
    )
    .refine(
      (data) => data.from > addDays(new Date(), -1),
      "Start date must be in the future"
    ),
});

export { BinSchema, DisposalSchema, RewardSchema };
