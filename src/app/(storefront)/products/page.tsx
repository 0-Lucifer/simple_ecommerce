import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { ProductCard } from "@/components/storefront/product-card";
import { CategoryFilter } from "@/components/storefront/category-filter";
import { EmptyState } from "@/components/storefront/empty-state";

export const metadata = { title: "Shop" };
export const revalidate = 300;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: category, search: q }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {activeCategory ? activeCategory.name : q ? `Results for “${q}”` : "Shop"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </header>

      <CategoryFilter categories={categories} active={category} />

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products to show yet"
            description="Once products are added from the owner dashboard, they'll appear here."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
