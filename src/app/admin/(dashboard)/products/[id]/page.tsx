import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAdminCategories, getAdminProduct } from "@/lib/data/admin";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/admin/products" />}
          aria-label="Back to products"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="font-heading text-2xl font-semibold">Edit product</h1>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
