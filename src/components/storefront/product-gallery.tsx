"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-muted">
        <ProductImage
          src={hasImages ? images[active] : null}
          alt={name}
          className="aspect-square"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative size-16 overflow-hidden rounded-lg ring-2 transition",
                active === i ? "ring-primary" : "ring-transparent hover:ring-border",
              )}
            >
              <ProductImage
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                className="size-16"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
