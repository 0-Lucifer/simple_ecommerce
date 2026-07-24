"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

type Result = { ok: true } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/products");
  revalidatePath("/");
}

function toRow(d: CategoryInput) {
  return {
    name: d.name,
    slug: d.slug,
    description: d.description || null,
    sort_order: d.sort_order ?? 0,
  };
}

export async function createCategory(input: CategoryInput): Promise<Result> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("categories").insert(toRow(parsed.data));
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That slug is already taken." : error.message,
    };
  }
  revalidate();
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Result> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That slug is already taken." : error.message,
    };
  }
  revalidate();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdmin();
  const admin = createAdminClient();
  // Products in this category have category_id set to null (FK on delete set null).
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}
