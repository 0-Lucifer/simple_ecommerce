"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Result> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const admin = createAdminClient();

  // Read the current status first: stock only moves when the change crosses the
  // "completed" boundary, so we need to know where we're coming from.
  const { data: current, error: readErr } = await admin
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();
  if (readErr || !current) {
    return { ok: false, error: "Order not found." };
  }

  const was = (current as { status: OrderStatus }).status;
  if (was === status) {
    return { ok: true }; // no change
  }

  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Stock follows completion: deduct the ordered quantities when an order
  // becomes "completed", and give them back if it's ever moved back out again.
  // Net effect — stock reflects exactly one deduction while an order is
  // completed, so toggling the status can't double-count.
  const entering = status === "completed" && was !== "completed";
  const leaving = was === "completed" && status !== "completed";
  if (entering || leaving) {
    await adjustStockForOrder(admin, id, entering ? -1 : 1);
    revalidatePath("/products");
    revalidatePath("/");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Adjusts product stock for every line item of an order. `direction` is -1 to
 * deduct (order completed) or +1 to restore (completion reversed). Stock is a
 * soft counter for a manual-fulfilment store, so deductions clamp at zero
 * rather than failing on an oversell.
 */
async function adjustStockForOrder(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
  direction: -1 | 1,
) {
  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  const rows = (items ?? []) as { product_id: string | null; quantity: number }[];

  // Sum quantities per product (an order could list the same product twice);
  // skip items whose product has since been deleted.
  const qtyById = new Map<string, number>();
  for (const r of rows) {
    if (!r.product_id) continue;
    qtyById.set(r.product_id, (qtyById.get(r.product_id) ?? 0) + r.quantity);
  }
  if (qtyById.size === 0) return;

  const { data: products } = await admin
    .from("products")
    .select("id, stock")
    .in("id", [...qtyById.keys()]);

  const stockById = new Map(
    ((products ?? []) as { id: string; stock: number }[]).map((p) => [
      p.id,
      Number(p.stock),
    ]),
  );

  await Promise.all(
    [...qtyById].map(([productId, qty]) => {
      const currentStock = stockById.get(productId) ?? 0;
      const next = Math.max(0, currentStock + direction * qty);
      return admin.from("products").update({ stock: next }).eq("id", productId);
    }),
  );
}
