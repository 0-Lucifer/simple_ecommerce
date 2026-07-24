/**
 * Domain types. These mirror the Supabase database schema (Phase 2). Kept in
 * one place so the storefront and dashboard share a single source of truth.
 */

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
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
  total: number
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit_price: number
  quantity: number
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}

/** Cart item — held client-side in the cart store (not persisted to DB). */
export type CartItem = {
  productId: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
}
