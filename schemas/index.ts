import { BinMaterial, BinStatus } from "@prisma/client";
import * as z from "zod";

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
  BinSchema,
  DisposalSchema,
};
