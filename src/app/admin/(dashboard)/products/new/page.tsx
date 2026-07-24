import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getAdminCategories } from "@/lib/data/admin";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await getAdminCategories();

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
        <h1 className="font-heading text-2xl font-semibold">New product</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
