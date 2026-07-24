"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { customerSchema, type CustomerInput } from "@/lib/validations/checkout";
import { createOrder } from "@/app/actions/orders";
import { useCart, selectCartTotal } from "@/lib/store/cart";
import { formatPrice, whatsappUrl } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { ProductImage } from "./product-image";
import { EmptyState } from "./empty-state";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const total = useCart(selectCartTotal);
  const clear = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({ resolver: zodResolver(customerSchema) });

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products before checking out."
        action={
          <Button className="rounded-full" render={<Link href="/products" />}>
            Browse products
          </Button>
        }
      />
    );
  }

  const onSubmit = async (values: CustomerInput) => {
    const res = await createOrder({
      ...values,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (res.ok) {
      clear();
      toast.success("Order placed!");
      router.push(`/checkout/success?order=${encodeURIComponent(res.orderNumber)}`);
    } else {
      toast.error(res.error);
    }
  };

  const waMessage =
    `Hi ${siteConfig.name}! I'd like to order:\n\n` +
    items
      .map((i) => `• ${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
      .join("\n") +
    `\n\nTotal: ${formatPrice(total)}`;
  const waLink = siteConfig.whatsappNumber
    ? whatsappUrl(siteConfig.whatsappNumber, waMessage)
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 lg:col-span-3"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="customer_name">Full name</Label>
          <Input
            id="customer_name"
            placeholder="Your name"
            aria-invalid={!!errors.customer_name}
            {...register("customer_name")}
          />
          {errors.customer_name && (
            <p className="text-sm text-destructive">
              {errors.customer_name.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_phone">Phone</Label>
            <Input
              id="customer_phone"
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              aria-invalid={!!errors.customer_phone}
              {...register("customer_phone")}
            />
            {errors.customer_phone && (
              <p className="text-sm text-destructive">
                {errors.customer_phone.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.customer_email}
              {...register("customer_email")}
            />
            {errors.customer_email && (
              <p className="text-sm text-destructive">
                {errors.customer_email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping_address">Delivery address</Label>
          <Textarea
            id="shipping_address"
            rows={3}
            placeholder="House, road, area, city"
            aria-invalid={!!errors.shipping_address}
            {...register("shipping_address")}
          />
          {errors.shipping_address && (
            <p className="text-sm text-destructive">
              {errors.shipping_address.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">
            Order note <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="note"
            rows={2}
            placeholder="Anything we should know?"
            {...register("note")}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
        </Button>

        {waLink && (
          <>
            <div className="text-center text-xs text-muted-foreground">or</div>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-full"
              render={
                <a href={waLink} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MessageCircle className="size-4" /> Order on WhatsApp instead
            </Button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground">
          No online payment. We&apos;ll contact you to confirm and arrange
          payment &amp; delivery.
        </p>
      </form>

      <aside className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border p-6">
          <h2 className="font-heading text-lg font-semibold">Your order</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <ProductImage
                    src={i.image}
                    alt={i.name}
                    className="size-14"
                    sizes="56px"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div>
                    <div className="line-clamp-1 text-sm font-medium">
                      {i.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty {i.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(i.price * i.quantity)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
