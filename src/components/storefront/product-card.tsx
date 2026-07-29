import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { priceRange } from "@/lib/product";
import type { ProductWithCategory } from "@/lib/types";
import { ProductImage } from "./product-image";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const image = product.images?.[0] ?? null;
  const hasWeights = product.variants.length > 0;
  const { min, max } = priceRange(product);
  const onSale =
    !hasWeights &&
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden rounded-2xl bg-muted"
      >
        <ProductImage src={image} alt={product.name} className="aspect-[4/5]" />
        {onSale && (
          <Badge className="absolute left-3 top-3 shadow-sm">Sale</Badge>
        )}
        {product.stock <= 0 && (
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 shadow-sm"
          >
            Sold out
          </Badge>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-1 font-medium transition-colors hover:text-muted-foreground"
        >
          {product.name}
        </Link>
        {product.category && (
          <div className="text-xs text-muted-foreground">
            {product.category.name}
          </div>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">
            {hasWeights && max > min ? `From ${formatPrice(min)}` : formatPrice(min)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
        {hasWeights && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {product.variants.map((v) => v.label).join(" · ")}
          </div>
        )}
        <div className="mt-3">
          <AddToCartButton product={product} className="w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
