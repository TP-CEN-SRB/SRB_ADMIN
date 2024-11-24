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
  location: z
    .string()
    .regex(/^[A-Za-z0-9\s,]+$/, "Invalid. Accepted: letters, numbers, commas"),
  status: z.nativeEnum(BinStatus, { message: "Invalid status" }),
  materialIds: z
    .array(z.string())
    .nonempty("At least one material must be selected"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
});

// const RewardSchema = z.object({
//   name: z.string({ message: "Name is required" }).min(2, "Name is too short"),
//   pointsRequired: z.coerce
//     .number({ message: "Points must be a number" })
//     .int("Points must be an integer")
//     .gte(1, "Points cannot be negative"),
//   description: z
//     .string({ message: "Description is required" })
//     .min(2, "Description is too short"),
//   image: z
//     .instanceof(File, { message: "Image is required" })
//     .refine((file: File) => file.size !== 0, "Image is required")
//     .refine((file) => file.size <= MAX_FILE_SIZE, {
//       message: `File size should not exceed ${
//         MAX_FILE_SIZE / (1024 * 1024)
//       } MB`,
//     })
//     .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
//       message: "Only .jpg, .jpeg, .png, and .webp files are accepted",
//     }),
//   dates: z
//     .object(
//       {
//         from: z.coerce.date({ message: "From date is required" }),
//         to: z.coerce.date({ message: "To date is required" }),
//       },
//       { message: "Dates are required" }
//     )
//     .refine(
//       (data) => data.from > addDays(new Date(), -1),
//       "Start date must be in the future"
//     ),
// });

const DateRangeSchema = z.discriminatedUnion("isCustomDateRange", [
  z.object({
    isCustomDateRange: z.literal(true),
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
  }),
  z.object({ isCustomDateRange: z.literal(false) }),
]);

const ImageSchema = z.discriminatedUnion("isExistingImage", [
  z.object({
    isExistingImage: z.literal(true),
  }),
  z.object({
    isExistingImage: z.literal(false),
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
  }),
]);

const RewardSchema = z
  .object({
    name: z.string({ message: "Name is required" }).min(2, "Name is too short"),
    pointsRequired: z.coerce
      .number({ message: "Points must be a number" })
      .int("Points must be an integer")
      .gte(1, "Points cannot be negative"),
    description: z
      .string({ message: "Description is required" })
      .min(2, "Description is too short"),
  })
  .and(DateRangeSchema)
  .and(ImageSchema);
const BinMaterialSchema = z.object({
  name: z
    .string()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
});

const UpdateBinSchema = z.object({
  location: z
    .string()
    .regex(/^[A-Za-z0-9\s,]+$/, "Invalid. Accepted: letters, numbers, commas"),
  status: z.nativeEnum(BinStatus, { message: "Invalid status" }),
  materialId: z.string().min(1, "Please select the material type"),
  // userId: z.string().min(1, "User ID is required"),
});

export {
  BinSchema,
  DisposalSchema,
  RewardSchema,
  BinMaterialSchema,
  UpdateBinSchema,
};
