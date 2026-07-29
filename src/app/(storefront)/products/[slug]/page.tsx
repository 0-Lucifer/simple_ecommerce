import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug, getProducts } from "@/lib/data/products";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductDetailPanel } from "@/components/storefront/product-detail-panel";

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

        <ProductDetailPanel product={product} />
      </div>
    </div>
  );
}
