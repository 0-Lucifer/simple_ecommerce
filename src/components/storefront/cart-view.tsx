"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useCart,
  selectCartTotal,
  selectCartWeight,
} from "@/lib/store/cart";
import { formatPrice, whatsappUrl } from "@/lib/format";
import {
  DELIVERY_ZONE_LABELS,
  billableKg,
  calculateDeliveryCharge,
} from "@/lib/delivery";
import { formatWeight } from "@/lib/product";
import { siteConfig } from "@/lib/site";
import { ProductImage } from "./product-image";
import { EmptyState } from "./empty-state";
import { DeliveryZonePicker } from "./delivery-zone-picker";

export function CartView() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectCartTotal);
  const weightKg = useCart(selectCartWeight);
  const zone = useCart((s) => s.deliveryZone);
  const setDeliveryZone = useCart((s) => s.setDeliveryZone);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse the collection and add something you love."
        action={
          <Button className="rounded-full" render={<Link href="/products" />}>
            Start shopping <ArrowRight className="size-4" />
          </Button>
        }
      />
    );
  }

  const delivery = calculateDeliveryCharge(weightKg, zone);
  const total = subtotal + delivery;

  const waMessage =
    `Hi ${siteConfig.name}! I'd like to order:\n\n` +
    items
      .map(
        (i) =>
          `• ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`,
      )
      .join("\n") +
    `\n\nSubtotal: ${formatPrice(subtotal)}` +
    `\nDelivery (${DELIVERY_ZONE_LABELS[zone]}): ${formatPrice(delivery)}` +
    `\nTotal: ${formatPrice(total)}`;
  const waLink = siteConfig.whatsappNumber
    ? whatsappUrl(siteConfig.whatsappNumber, waMessage)
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-4">
              <Link
                href={`/products/${item.slug}`}
                className="group relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  className="size-24"
                  sizes="96px"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {item.variantLabel && (
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    Weight: {item.variantLabel}
                  </div>
                )}
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(item.price)}
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              clear();
              toast.success("Cart cleared");
            }}
          >
            Clear cart
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border p-6">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>

          <div className="mt-4">
            <div className="text-sm font-medium">Delivery to</div>
            <DeliveryZonePicker
              value={zone}
              onChange={setDeliveryZone}
              weightKg={weightKg}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {weightKg > 0 ? (
                <>
                  {formatWeight(weightKg)} in the cart — charged as{" "}
                  {billableKg(weightKg)} kg.
                </>
              ) : (
                <>Flat rate — nothing in your cart is sold by weight.</>
              )}
            </p>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Delivery · {DELIVERY_ZONE_LABELS[zone]}
              </span>
              <span>{formatPrice(delivery)}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            No online payment — we&apos;ll contact you to confirm and arrange
            payment.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              className="h-11 rounded-full"
              render={<Link href="/checkout" />}
            >
              Checkout <ArrowRight className="size-4" />
            </Button>
            {waLink && (
              <Button
                variant="outline"
                className="h-11 rounded-full"
                render={
                  <a href={waLink} target="_blank" rel="noopener noreferrer" />
                }
              >
                <MessageCircle className="size-4" /> Order on WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
