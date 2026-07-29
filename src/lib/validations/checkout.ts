import { z } from "zod";

import { DELIVERY_ZONES } from "@/lib/delivery";

export const customerSchema = z.object({
  customer_name: z.string().min(2, "Please enter your name"),
  customer_phone: z.string().min(6, "Please enter a valid phone number"),
  customer_email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  shipping_address: z
    .string()
    .min(6, "Please enter your full delivery address"),
  note: z.string().max(500).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const createOrderSchema = customerSchema.extend({
  delivery_zone: z.enum(DELIVERY_ZONES, {
    message: "Please choose a delivery area",
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        // Which weight was picked; null for products sold at a single price.
        variantId: z.string().min(1).nullable().optional(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
