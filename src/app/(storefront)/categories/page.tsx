import Link from "next/link";

import { getCategoriesWithCovers } from "@/lib/data/categories";
import { EmptyState } from "@/components/storefront/empty-state";
import { ProductImage } from "@/components/storefront/product-image";

export const metadata = { title: "Categories" };
export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCovers();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Categories
        </h1>
        <p className="mt-1 text-muted-foreground">Browse by collection.</p>
      </header>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Categories added from the dashboard will appear here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl"
            >
              {c.cover ? (
                <ProductImage
                  src={c.cover}
                  alt={c.name}
                  className="absolute inset-0 size-full"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent to-secondary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <span className="relative p-4 font-heading text-lg font-semibold text-white drop-shadow-sm">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
