"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { WhatsAppOrderButton } from "./whatsapp-order-button";

export function ProductPurchase({ product }: { product: ProductWithCategory }) {
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const max = product.stock > 0 ? product.stock : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Quantity</span>
        <div className="flex items-center rounded-full border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={soldOut || qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={soldOut || qty >= max}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <AddToCartButton
          product={product}
          quantity={qty}
          className="h-11 flex-1 rounded-full"
        />
        <WhatsAppOrderButton
          product={product}
          quantity={qty}
          className="h-11 flex-1 rounded-full"
        />
      </div>
    </div>
  );
}
