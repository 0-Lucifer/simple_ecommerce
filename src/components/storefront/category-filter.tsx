import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const pill =
  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors";

export function CategoryFilter({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={cn(
          pill,
          !active
            ? "border-primary bg-primary text-primary-foreground"
            : "hover:bg-muted",
        )}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/products?category=${c.slug}`}
          className={cn(
            pill,
            active === c.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
