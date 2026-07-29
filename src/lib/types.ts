/**
 * Domain types. These mirror the Supabase database schema (Phase 2). Kept in
 * one place so the storefront and dashboard share a single source of truth.
 */

import type { DeliveryZone } from "@/lib/delivery"

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  created_at: string
}

/**
 * One weight option of a product — e.g. "500 g" at ৳450. A product with an
 * empty `variants` array has no weight variations: a single price, and the
 * flat-rate delivery minimum applies.
 */
export type ProductVariant = {
  id: string
  /** Human label shown to the customer, e.g. "500 g" or "1.5 kg". */
  label: string
  /** Weight of one unit in kilograms — drives the delivery charge. */
  weight_kg: number
  price: number
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  variants: ProductVariant[]
  images: string[]
  category_id: string | null
  stock: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "paid",
  "shipped",
  "completed",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  shipping_address: string
  note: string | null
  status: OrderStatus
  subtotal: number
  delivery_zone: DeliveryZone | null
  delivery_charge: number
  total_weight_kg: number
  total: number
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  variant_label: string | null
  weight_kg: number
  unit_price: number
  quantity: number
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}

/** Cart item — held client-side in the cart store (not persisted to DB). */
export type CartItem = {
  /**
   * Cart line identity. The same product in two different weights is two
   * separate lines, so this is `productId:variantId` when a weight is chosen.
   */
  key: string
  productId: string
  variantId: string | null
  /** e.g. "500 g" — null when the product has no weight variations. */
  variantLabel: string | null
  /** Weight of one unit in kg; 0 when the product has no weight. */
  weightKg: number
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
}
