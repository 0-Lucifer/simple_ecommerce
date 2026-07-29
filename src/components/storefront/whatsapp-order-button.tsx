"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { formatPrice, whatsappUrl } from "@/lib/format";
import type { Product, ProductVariant, ProductWithCategory } from "@/lib/types";

export function WhatsAppOrderButton({
  product,
  quantity = 1,
  variant,
  className,
}: {
  product: Product | ProductWithCategory;
  quantity?: number;
  /** The chosen weight, so the message quotes the right size and price. */
  variant?: ProductVariant | null;
  className?: string;
}) {
  if (!siteConfig.whatsappNumber) return null;

  const unitPrice = variant?.price ?? product.price;
  const name = variant ? `${product.name} (${variant.label})` : product.name;
  const message =
    `Hi ${siteConfig.name}! I'd like to order:\n\n` +
    `• ${name} × ${quantity} — ${formatPrice(unitPrice * quantity)}\n\n` +
    `Is it available?`;
  const url = whatsappUrl(siteConfig.whatsappNumber, message);

  return (
    <Button
      variant="outline"
      className={className}
      render={<a href={url} target="_blank" rel="noopener noreferrer" />}
    >
      <MessageCircle className="size-4" /> Order on WhatsApp
    </Button>
  );
}
