import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { getAdminProducts } from "@/lib/data/admin";
import { deleteProduct } from "@/lib/actions/products";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductImage } from "@/components/storefront/product-image";
import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState } from "@/components/storefront/empty-state";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground">{products.length} total</p>
        </div>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="size-4" /> Add product
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to stock the store."
          action={
            <Button render={<Link href="/admin/products/new" />}>
              <Plus className="size-4" /> Add product
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <ProductImage
                          src={p.images?.[0] ?? null}
                          alt={p.name}
                          className="size-11"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          /{p.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.variants.length > 0 ? (
                      <>
                        <div>From {formatPrice(Number(p.price))}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.variants.map((v) => v.label).join(" · ")}
                        </div>
                      </>
                    ) : (
                      formatPrice(Number(p.price))
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.stock}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.is_active ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-950 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Hidden
                        </span>
                      )}
                      {p.is_featured && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Featured
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={<Link href={`/admin/products/${p.id}`} />}
                        aria-label="Edit product"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteButton
                        action={deleteProduct}
                        id={p.id}
                        label="Delete product"
                        confirmText={`Delete "${p.name}"? This can't be undone.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
