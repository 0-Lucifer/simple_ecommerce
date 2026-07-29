"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import type { Product, ProductVariant, ProductWithCategory } from "@/lib/types";

export function AddToCartButton({
  product,
  quantity = 1,
  variant,
  className,
}: {
  product: Product | ProductWithCategory;
  quantity?: number;
  /**
   * The weight the customer already chose (product page). Omit it — as the
   * product cards do — and clicking opens a weight picker instead.
   */
  variant?: ProductVariant | null;
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  const soldOut = product.stock <= 0;
  const options = product.variants ?? [];
  // Weights exist but none was handed to us — ask before adding.
  const needsChoice = options.length > 0 && !variant;

  function add(chosen: ProductVariant | null) {
    addItem(
      {
        productId: product.id,
        variantId: chosen?.id ?? null,
        variantLabel: chosen?.label ?? null,
        weightKg: chosen?.weight_kg ?? 0,
        name: product.name,
        slug: product.slug,
        price: chosen?.price ?? product.price,
        image: product.images?.[0] ?? null,
      },
      quantity,
    );
    toast.success(
      `${product.name}${chosen ? ` · ${chosen.label}` : ""} added to cart`,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  function handleClick() {
    if (needsChoice) {
      setPicked(options[0]?.id ?? null);
      setPickerOpen(true);
      return;
    }
    add(variant ?? null);
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
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

      {needsChoice && (
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose a weight</DialogTitle>
              <DialogDescription>
                {product.name} comes in {options.length} sizes — prices differ
                by weight.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              {options.map((option) => {
                const selected = picked === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPicked(option.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="tabular-nums">
                      {formatPrice(option.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              className="h-11 w-full rounded-full"
              disabled={!picked}
              onClick={() => {
                const chosen = options.find((o) => o.id === picked);
                if (!chosen) return;
                add(chosen);
                setPickerOpen(false);
              }}
            >
              <ShoppingBag className="size-4" /> Add to cart
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
