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
    .trim()
    .regex(/^[A-Za-z0-9\s,]+$/, "Invalid. Accepted: letters, numbers, commas")
    .min(2, "Location is too short"),
  status: z.nativeEnum(BinStatus, { message: "Invalid status" }),
  materialIds: z
    .array(z.string())
    .nonempty("At least one material must be selected"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
});

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
    name: z
      .string({ message: "Name is required" })
      .trim()
      .min(2, "Name is too short"),
    pointsRequired: z.coerce
      .number({ message: "Points must be a number" })
      .int("Points must be an integer")
      .gte(1, "Points cannot be less than 1")
      .max(2147483647, "Maximum value is 2147483647"),
    description: z
      .string({ message: "Description is required" })
      .min(2, "Description is too short"),
    isAvailable: z.boolean(),
  })
  .and(DateRangeSchema)
  .and(ImageSchema);
const BinMaterialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  multiplier: z.coerce
    .number()
    .gte(0, "Multiplier cannot be negative")
    .lte(
      1.7976931348623157e308,
      "Multiplier exceeds the maximum limit for a float"
    )
    .multipleOf(0.1, "Multipler can only be set to 1 d.p."),
});

const SubscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
});

const UpdateBinSchema = z.object({
  location: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9\s,]+$/, "Invalid. Accepted: letters, numbers, commas"),
  status: z.nativeEnum(BinStatus, { message: "Invalid status" }),
  materialId: z.string().min(1, "Please select the material type"),
});

const QuestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  target: z.coerce.number().min(1, "Target must be at least 1"),
  materialType: z.enum(["PLASTIC", "METAL", "PAPER", "E_WASTE", "GENERAL"]),
  rewardPoints: z.coerce.number().min(1, "Reward must be at least 1"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
});

export const MaterialEnum = ["PLASTIC", "METAL", "PAPER", "E_WASTE", "GENERAL"] as const;
export type MaterialType = (typeof MaterialEnum)[number];

const UpdateQuestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  target: z.coerce.number().min(1, "Target must be at least 1"),
  materialType: z.enum(MaterialEnum, {
    errorMap: () => ({ message: "Material is required" }),
  }),
  rewardPoints: z.coerce.number().min(1, "Reward must be at least 1"),
});

const StoreSchema = z.object({
    name: z.string().min(1, "Store name is required"),
    email: z.string().email("Invalid email"),
    faculty: z.enum(["ENG", "BUS", "ASC", "IIT", "HSS", "DES", "OTHERS", "EXT"]),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const UpdateStoreSchema = z.object({
    name: z.string().min(1, "Store name is required"),
    email: z.string().email("Invalid email address"),
    faculty: z.string().min(1, "Faculty is required"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.password || data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );



export {
  BinSchema,
  DisposalSchema,
  RewardSchema,
  BinMaterialSchema,
  UpdateBinSchema,
  SubscriptionSchema,
  QuestSchema,
  UpdateQuestSchema,
  StoreSchema,
  UpdateStoreSchema,
};
