"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema, type ProductInput } from "@/lib/validations/product";

type Result = { ok: true } | { ok: false; error: string };

function toRow(d: ProductInput) {
  return {
    name: d.name,
    slug: d.slug,
    description: d.description || null,
    price: d.price,
    compare_at_price: d.compare_at_price ?? null,
    images: d.images ?? [],
    category_id: d.category_id ? d.category_id : null,
    stock: d.stock,
    is_active: d.is_active,
    is_featured: d.is_featured,
  };
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/products/${slug}`);
}

/** Uploads a single image file to Storage and returns its public URL. */
export async function uploadProductImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Image must be under 8MB." };
  }

  const admin = createAdminClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await admin.storage
    .from("product-images")
    .upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (error) return { error: error.message };

  return {
    url: admin.storage.from("product-images").getPublicUrl(path).data.publicUrl,
  };
}

export async function createProduct(input: ProductInput): Promise<Result> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").insert(toRow(parsed.data));
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That slug is already taken." : error.message,
    };
  }
  revalidateStorefront(parsed.data.slug);
  return { ok: true };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Result> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That slug is already taken." : error.message,
    };
  }
  revalidateStorefront(parsed.data.slug);
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true };
}
