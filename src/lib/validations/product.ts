import { z } from "zod";

/**
 * One weight option. `weight_kg` is always stored in kilograms even though the
 * dashboard lets the owner type grams — one unit keeps delivery maths simple.
 */
export const productVariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Weight label is required"),
  weight_kg: z
    .number({ message: "Enter a weight" })
    .positive("Weight must be more than 0")
    .max(1000, "That weight looks too large"),
  price: z
    .number({ message: "Enter a price" })
    .nonnegative("Price can't be negative"),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().max(5000).optional().or(z.literal("")),
  price: z
    .number({ message: "Enter a price" })
    .nonnegative("Price can't be negative"),
  compare_at_price: z
    .number()
    .nonnegative("Can't be negative")
    .nullable()
    .optional(),
  variants: z
    .array(productVariantSchema)
    .max(20, "That's a lot of weights — 20 max")
    .optional(),
  category_id: z.string().uuid().nullable().optional().or(z.literal("")),
  stock: z
    .number({ message: "Enter a stock quantity" })
    .int("Whole number only")
    .nonnegative("Can't be negative"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  images: z.array(z.string().url()).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
