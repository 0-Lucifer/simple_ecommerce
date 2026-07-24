"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import type { Product, ProductWithCategory } from "@/lib/types";

export function AddToCartButton({
  product,
  quantity = 1,
  className,
}: {
  product: Product | ProductWithCategory;
  quantity?: number;
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0] ?? null,
      },
      quantity,
    );
    toast.success(`${product.name} added to cart`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={soldOut}
      variant={soldOut ? "secondary" : "default"}
      className={className}
    >
      {soldOut ? (
        "Sold out"
      ) : added ? (
        <>
          <Check className="size-4" /> Added
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" /> Add to cart
        </>
      )}
    </Button>
  );
}
