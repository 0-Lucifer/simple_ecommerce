import { z } from "zod";

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
