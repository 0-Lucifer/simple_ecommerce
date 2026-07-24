import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProducts } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";

type Params = { params: Promise<{ slug: string }> };

// Pre-render every product page at build; refresh on an interval and on edit.
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts({ limit: 200 });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const onSale =
    product.compare_at_price != null && product.compare_at_price > product.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/products" className="transition-colors hover:text-foreground">
          Shop
        </Link>
        {product.category && (
          <>
            <span className="mx-1.5">/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images ?? []} name={product.name} />

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
            <span className="text-2xl font-semibold">
              {formatPrice(product.price)}
            </span>
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

          {product.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
