"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { calculateDeliveryCharge } from "@/lib/delivery";
import { parseVariants } from "@/lib/product";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "@/lib/validations/checkout";

type Result =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

/**
 * Creates an order. Runs on the server with the service-role key so it can:
 *  - recompute prices, weights and the delivery charge from the database
 *    (never trust anything the client sent about money)
 *  - insert the order + items regardless of who's logged in (guest checkout)
 */
export async function createOrder(input: CreateOrderInput): Promise<Result> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error:
        "The store isn't connected to the database yet. Please order via WhatsApp.",
    };
  }

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check your details.",
    };
  }

  const { items, delivery_zone, ...customer } = parsed.data;
  const admin = createAdminClient();

  const ids = [...new Set(items.map((i) => i.productId))];
  const { data: products, error } = await admin
    .from("products")
    .select("id, name, price, stock, is_active, variants")
    .in("id", ids);

  if (error || !products) {
    return { ok: false, error: "Couldn't verify the products. Please try again." };
  }

  const lineItems: {
    product_id: string;
    product_name: string;
    variant_label: string | null;
    weight_kg: number;
    unit_price: number;
    quantity: number;
  }[] = [];
  let subtotal = 0;
  let totalWeightKg = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.is_active) {
      return { ok: false, error: "One of the items is no longer available." };
    }

    // The weight options are the source of truth for price when they exist.
    const variants = parseVariants(product.variants);
    let unitPrice = Number(product.price);
    let weightKg = 0;
    let variantLabel: string | null = null;

    if (variants.length > 0) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return {
          ok: false,
          error: `Please choose a weight for “${product.name}” — its options have changed.`,
        };
      }
      unitPrice = variant.price;
      weightKg = variant.weight_kg;
      variantLabel = variant.label;
    }

    subtotal += unitPrice * item.quantity;
    totalWeightKg += weightKg * item.quantity;
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      variant_label: variantLabel,
      weight_kg: weightKg,
      unit_price: unitPrice,
      quantity: item.quantity,
    });
  }

  const deliveryCharge = calculateDeliveryCharge(totalWeightKg, delivery_zone);

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone,
      customer_email: customer.customer_email || null,
      shipping_address: customer.shipping_address,
      note: customer.note || null,
      subtotal,
      delivery_zone,
      delivery_charge: deliveryCharge,
      total_weight_kg: totalWeightKg,
      total: subtotal + deliveryCharge,
      status: "pending",
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    return { ok: false, error: "Couldn't place the order. Please try again." };
  }

  const { error: itemsErr } = await admin
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

  if (itemsErr) {
    return {
      ok: false,
      error: "Couldn't save the order items. Please contact us.",
    };
  }

  return { ok: true, orderNumber: order.order_number as string };
}
