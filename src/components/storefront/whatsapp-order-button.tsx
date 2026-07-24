"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { formatPrice, whatsappUrl } from "@/lib/format";
import type { Product, ProductWithCategory } from "@/lib/types";

export function WhatsAppOrderButton({
  product,
  quantity = 1,
  className,
}: {
  product: Product | ProductWithCategory;
  quantity?: number;
  className?: string;
}) {
  if (!siteConfig.whatsappNumber) return null;

  const message =
    `Hi ${siteConfig.name}! I'd like to order:\n\n` +
    `• ${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}\n\n` +
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
