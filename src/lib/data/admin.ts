import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Order,
  OrderItem,
  OrderWithItems,
  Product,
  ProductWithCategory,
} from "@/lib/types";

export async function getDashboardStats() {
  const supabase = await createClient();
  const [products, orders, pending, paid] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("total")
      .in("status", ["paid", "shipped", "completed"]),
  ]);

  const revenue = (paid.data ?? []).reduce(
    (sum, o) => sum + Number((o as { total: number }).total),
    0,
  );

  return {
    productCount: products.count ?? 0,
    orderCount: orders.count ?? 0,
    pendingCount: pending.count ?? 0,
    revenue,
  };
}

export async function getAdminProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ProductWithCategory[];
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as Product;
  return {
    ...row,
    price: Number(row.price),
    compare_at_price:
      row.compare_at_price == null ? null : Number(row.compare_at_price),
  };
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as Category[];
}

export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Order[];
}

export async function getAdminOrder(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!order) return null;
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);
  return { ...(order as Order), items: (items ?? []) as OrderItem[] };
}
