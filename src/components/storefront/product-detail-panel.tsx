"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { findVariant } from "@/lib/product";
import type { ProductWithCategory } from "@/lib/types";
import { ProductPurchase } from "./product-purchase";

/**
 * The buy-side column of a product page. It's one client component because the
 * headline price, the weight buttons and the add-to-cart action all read the
 * same selection.
 */
export function ProductDetailPanel({
  product,
}: {
  product: ProductWithCategory;
}) {
  const options = product.variants;
  const [variantId, setVariantId] = useState<string | null>(
    options[0]?.id ?? null,
  );
  const selected = findVariant(product, variantId);

  const price = selected?.price ?? product.price;
  // A "was" price can't be pinned to a specific weight, so only plain
  // single-price products show the sale styling.
  const onSale =
    options.length === 0 &&
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  return (
    <div>
      {product.category && (
        <div className="text-sm text-muted-foreground">
          {product.category.name}
        </div>
      )}
      <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-semibold">{formatPrice(price)}</span>
        {selected && (
          <span className="text-sm text-muted-foreground">
            per {selected.label}
          </span>
        )}
        {onSale && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
            <Badge>Sale</Badge>
          </>
        )}
      </div>

      <div className="mt-2 text-sm">
        {product.stock > 0 ? (
          <span className="text-green-600 dark:text-green-500">In stock</span>
        ) : (
          <span className="text-destructive">Sold out</span>
        )}
      </div>

      {options.length > 0 && (
        <div className="mt-6">
          <div className="text-sm font-medium">Weight</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((option) => {
              const active = option.id === variantId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVariantId(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="ml-2 text-muted-foreground tabular-nums">
                    {formatPrice(option.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {product.description && (
        <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      )}

      <div className="mt-8">
        <ProductPurchase product={product} variant={selected} />
      </div>
    </div>
  );
}
