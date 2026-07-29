"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  productSchema,
  type ProductInput,
  type ProductVariantInput,
} from "@/lib/validations/product";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/lib/actions/products";
import { formatPrice } from "@/lib/format";
import { formatWeight } from "@/lib/product";
import type { Category, Product } from "@/lib/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A weight row as typed in the form. Kept as strings so a half-typed number
 * doesn't fight the inputs; converted to kilograms on the way out.
 */
type WeightRow = { id: string; amount: string; unit: "g" | "kg"; price: string };

function newRow(): WeightRow {
  return { id: crypto.randomUUID(), amount: "", unit: "g", price: "" };
}

/** Existing product → editable rows (grams below 1 kg, kilograms above). */
function toRows(product?: Product): WeightRow[] {
  return (product?.variants ?? []).map((v) => ({
    id: v.id,
    amount: v.weight_kg < 1 ? String(v.weight_kg * 1000) : String(v.weight_kg),
    unit: v.weight_kg < 1 ? "g" : "kg",
    price: String(v.price),
  }));
}

/** Rows → saveable weight options. Returns an error message if any row is bad. */
function toVariants(rows: WeightRow[]): {
  variants: ProductVariantInput[];
  error: string | null;
} {
  const variants: ProductVariantInput[] = [];
  for (const row of rows) {
    const amount = Number(row.amount);
    const price = Number(row.price);
    if (!row.amount.trim() || !Number.isFinite(amount) || amount <= 0) {
      return { variants: [], error: "Every weight needs a number above 0." };
    }
    if (!row.price.trim() || !Number.isFinite(price) || price < 0) {
      return { variants: [], error: "Every weight needs a price." };
    }
    const weight_kg = row.unit === "g" ? amount / 1000 : amount;
    const label = formatWeight(weight_kg);
    if (variants.some((v) => v.label === label)) {
      return { variants: [], error: `“${label}” is listed twice.` };
    }
    variants.push({ id: row.id, label, weight_kg, price });
  }
  return { variants, error: null };
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const isEdit = !!product;
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [rows, setRows] = useState<WeightRow[]>(() => toRows(product));
  const [rowError, setRowError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      compare_at_price: product?.compare_at_price ?? null,
      variants: product?.variants ?? [],
      category_id: product?.category_id ?? "",
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      images: product?.images ?? [],
    },
  });

  // Keep the form's images field in sync with the uploaded-images state.
  useEffect(() => {
    setValue("images", images);
  }, [images, setValue]);

  const { variants, error: variantError } = toVariants(rows);
  const hasWeights = rows.length > 0;
  const lowestPrice = variants.length
    ? Math.min(...variants.map((v) => v.price))
    : null;

  // Weight options own the price once they exist: the product's own price
  // field becomes the cheapest option so listings still have something to show.
  useEffect(() => {
    setValue("variants", variants);
    if (lowestPrice != null) setValue("price", lowestPrice);
    // `variants` is rebuilt each render — compare by value, not identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(variants), lowestPrice, setValue]);

  function updateRow(id: string, patch: Partial<WeightRow>) {
    setRowError(null);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const nameReg = register("name");
  const slugReg = register("slug");

  async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadProductImage(fd);
        if ("url" in res) uploaded.push(res.url);
        else toast.error(res.error);
      }
      if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function onSubmit(values: ProductInput) {
    if (variantError) {
      setRowError(variantError);
      toast.error(variantError);
      return;
    }
    startTransition(async () => {
      const payload = { ...values, images, variants };
      const res = isEdit
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      if (res.ok) {
        toast.success(isEdit ? "Product updated" : "Product created");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-3"
    >
      <div className="space-y-6 lg:col-span-2">
        <Field label="Name" error={errors.name?.message}>
          <Input
            {...nameReg}
            onChange={(e) => {
              nameReg.onChange(e);
              if (!slugEdited) setValue("slug", slugify(e.target.value));
            }}
            placeholder="e.g. Natural Beeswax Blocks"
          />
        </Field>

        <Field
          label="Slug (URL)"
          error={errors.slug?.message}
          hint="Auto-filled from the name. Lowercase letters, numbers and hyphens."
        >
          <Input
            {...slugReg}
            onChange={(e) => {
              setSlugEdited(true);
              slugReg.onChange(e);
            }}
            placeholder="natural-beeswax-blocks"
          />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <Textarea
            rows={5}
            {...register("description")}
            placeholder="Describe the product, sizes, usage tips…"
          />
        </Field>

        <div className="space-y-3 rounded-2xl border bg-card p-5">
          <div>
            <Label>Weight options</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Sell the same product in different weights, each at its own price
              (e.g. 500 g for ৳450, 1 kg for ৳850). Customers pick a weight
              before adding to the cart, and the weight sets the delivery
              charge. Leave this empty for a single-price product.
            </p>
          </div>

          {rows.length > 0 && (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li key={row.id} className="flex items-end gap-2">
                  <div className="w-28 shrink-0 space-y-1">
                    <span className="text-xs text-muted-foreground">Weight</span>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(row.id, { amount: e.target.value })
                      }
                      placeholder="500"
                    />
                  </div>
                  <div className="w-20 shrink-0 space-y-1">
                    <span className="text-xs text-muted-foreground">Unit</span>
                    <select
                      value={row.unit}
                      onChange={(e) =>
                        updateRow(row.id, {
                          unit: e.target.value as WeightRow["unit"],
                        })
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      aria-label="Weight unit"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Price (৳)
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={row.price}
                      onChange={(e) =>
                        updateRow(row.id, { price: e.target.value })
                      }
                      placeholder="450"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-0.5"
                    onClick={() => {
                      setRowError(null);
                      setRows((prev) => prev.filter((r) => r.id !== row.id));
                    }}
                    aria-label="Remove this weight"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((prev) => [...prev, newRow()])}
          >
            <Plus className="size-4" /> Add a weight
          </Button>

          {rowError && <p className="text-sm text-destructive">{rowError}</p>}
        </div>

        <div className="space-y-2">
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div
                key={url}
                className="group relative size-24 overflow-hidden rounded-xl border bg-muted"
              >
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-1 shadow transition group-hover:opacity-100 sm:opacity-0"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <label
              className={cn(
                "flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition hover:bg-muted",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" />
              )}
              <span className="text-xs">{uploading ? "Uploading" : "Add"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFilesSelected}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            The first photo is used as the main image. JPG/PNG/WebP, up to 8MB each.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          {hasWeights ? (
            <div className="space-y-2">
              <Label>Price (৳)</Label>
              <div className="rounded-md border border-dashed px-3 py-2 text-sm">
                {lowestPrice != null ? (
                  <>
                    From{" "}
                    <span className="font-medium">
                      {formatPrice(lowestPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Set by your weight options — each weight has its own price.
              </p>
            </div>
          ) : (
            <Field label="Price (৳)" error={errors.price?.message}>
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                {...register("price", { valueAsNumber: true })}
              />
            </Field>
          )}
          <Field
            label="Compare-at price (৳)"
            error={errors.compare_at_price?.message}
            hint="Optional. Shows a struck-through 'was' price."
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              {...register("compare_at_price", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
            />
          </Field>
          <Field
            label="Stock"
            error={errors.stock?.message}
            hint={hasWeights ? "Shared across all weights." : undefined}
          >
            <Input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              {...register("stock", { valueAsNumber: true })}
            />
          </Field>
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              {...register("category_id")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border bg-card p-5">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...register("is_active")}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">Active</span>
              <span className="block text-muted-foreground">
                Visible in the store
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...register("is_featured")}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">Featured</span>
              <span className="block text-muted-foreground">
                Show on the homepage
              </span>
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={pending || uploading}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link href="/admin/products" />}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
